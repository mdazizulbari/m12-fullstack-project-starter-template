require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SK_KEY);

const port = process.env.PORT || 3000;
const app = express();
// middleware
const corsOptions = {
  origin: ["https://conceptual12.netlify.app"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  const db = client.db("plantdb");
  const plantsCollection = db.collection("plants");
  const ordersCollection = db.collection("orders");
  const usersCollection = db.collection("users");

  try {
    const verifyAdmin = async (req, res, next) => {
      const email = req?.user?.email;
      const user = await usersCollection.findOne({ email });
      console.log(user?.role);

      if (!user || user?.role !== "admin")
        return res.status(403).send({ message: "Admin only access!" });
      next();
    };

    const verifySeller = async (req, res, next) => {
      const email = req?.user?.email;
      const user = await usersCollection.findOne({ email });
      console.log(user?.role);

      if (!user || user?.role !== "seller")
        return res.status(403).send({ message: "Seller only access!" });
      next();
    };

    // Generate jwt token
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      // rules that we have to follow to make jwt work on production
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // add a plant in db
    app.post("/add-plant", verifyToken, verifySeller, async (req, res) => {
      const plant = req.body;
      const result = await plantsCollection.insertOne(plant);
      // console.log(plant);
      res.send(result);
    });

    // get all plants data from db
    app.get("/plants", async (req, res) => {
      const result = await plantsCollection.find().toArray();
      res.send(result);
    });

    // get a single plant data from db
    app.get("/plant/:id", async (req, res) => {
      const id = req.params.id;
      const result = await plantsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // create payment intent for orderData
    app.post("/create-payment-intent", async (req, res) => {
      const { plantId, quantity } = req.body;
      const plant = await plantsCollection.findOne({
        _id: new ObjectId(plantId),
      });
      if (!plant) return res.status(404).send({ message: "Plant Not Found" });
      const totalPrice = quantity * plant?.price * 100;

      // stripe ...
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // console.log(plantId, quantity);
      res.send({ clientSecret: paymentIntent.client_secret });
    });

    // save or update a users info in db
    app.post("/user", async (req, res) => {
      const userData = req.body;
      userData.role = "customer";
      userData.created_at = new Date().toISOString();
      userData.last_loggedIn = new Date().toISOString();

      const query = {
        email: userData?.email,
      };
      const alreadyExists = await usersCollection.findOne(query);

      console.log("User already exists: ", !!alreadyExists);
      if (!!alreadyExists) {
        console.log("Updating user data");
        const result = await usersCollection.updateOne(query, {
          $set: { last_loggedIn: new Date().toISOString() },
        });
        return res.send(result);
      }

      // return console.log(userData);
      console.log("Creating user data");
      const result = await usersCollection.insertOne(userData);
      res.send(result);
    });

    // get a user's role
    app.get("/user/role/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      if (!result) return res.status(404).send({ message: "User not found" });
      res.send({ role: result?.role });
    });

    // save order data in orders collection in db
    app.post("/order", async (req, res) => {
      const orderData = req.body;
      const result = await ordersCollection.insertOne(orderData);
      res.send(result);
    });

    // get all order info for customer
    app.get("/orders/customer/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const filter = { "customer.email": email };
      const result = await ordersCollection.find(filter).toArray();
      res.send(result);
    });

    // get all order info for seller
    app.get(
      "/orders/seller/:email",
      verifySeller,
      verifyToken,
      async (req, res) => {
        const email = req.params.email;
        const filter = { "seller.email": email };
        const result = await ordersCollection.find(filter).toArray();
        res.send(result);
      }
    );

    // update plant quantity(increase/decrease)
    app.patch("/quantity-update/:id", async (req, res) => {
      const id = req.params.id;
      const { quantityToUpdate, status } = req.body;
      const filter = { _id: new ObjectId(id) };
      let updateDoc = {
        $inc: {
          quantity:
            status === "increase" ? quantityToUpdate : -quantityToUpdate,
        },
      };
      const result = await plantsCollection.updateOne(filter, updateDoc);
      console.log(result);
      console.log(quantityToUpdate, status);
      res.send(result);
    });

    // get all users for admin
    app.get("/all-users", verifyToken, verifyAdmin, async (req, res) => {
      console.log(req.user);
      const filter = {
        email: {
          $ne: req?.user?.email,
        },
      };
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    // update a user's role
    app.patch(
      "/user/role/update/:email",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const { role } = req.body;
        const filter = { email: email };
        updateDoc = {
          $set: {
            role,
            status: "verified",
          },
        };
        const result = await usersCollection.updateOne(filter, updateDoc);
        console.log(role, result);
        res.send(result);
      }
    );

    // become seller request
    app.patch(
      "/become-seller-request/:email",
      verifyToken,
      async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        updateDoc = {
          $set: {
            status: "Requested",
          },
        };
        const result = await usersCollection.updateOne(filter, updateDoc);
        console.log(result);
        res.send(result);
      }
    );

    // admin stats
    app.get("/admin-stats", verifyToken, verifyAdmin, async (req, res) => {
      // const totalUsers = (await usersCollection.find().toArray()).length;
      // other options provided by MongoDB
      // const totalUsers = await usersCollection.countDocuments({ role: admin });
      // this one works slow but the one shown below is fast
      const totalUsers = await usersCollection.estimatedDocumentCount();
      const orders = await ordersCollection.estimatedDocumentCount();
      const totalPlants = await plantsCollection.estimatedDocumentCount();

      // mongodb aggregation
      const result = await ordersCollection
        .aggregate([
          {
            // convert id into data
            $addFields: {
              createdAt: { $toDate: "$_id" },
            },
          },
          {
            // group data by data
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              revenue: { $sum: "$price" },
              orders: { $sum: 1 },
            },
          },
        ])
        .toArray();

      const barChartData = result.map((data) => ({
        date: data._id,
        revenue: data.revenue,
        orders: data.orders,
      }));
      const totalRevenue = result.reduce((sum, data) => sum + data?.revenue, 0);

      res.send({
        totalUsers,
        totalPlants,
        barChartData,
        orders,
        totalRevenue,
      });
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from plantNet Server..");
});

app.listen(port, () => {
  console.log(`plantNet is running on port ${port}`);
});
