import useAuth from "../../../hooks/useAuth";

import coverImg from "../../../assets/images/cover.jpg";
import useRole from "../../../hooks/useRole";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";

const Profile = () => {
  const { user } = useAuth();
  const [role, isRoleLoading] = useRole();
  if (isRoleLoading) return <LoadingSpinner />;
  console.log(role);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white shadow-lg rounded-2xl md:w-4/5 lg:w-3/5">
        <img
          alt="cover photo"
          src={coverImg}
          className="w-full mb-4 rounded-t-lg h-56"
        />
        <div className="flex flex-col items-center justify-center p-4 -mt-16">
          <a href="#" className="relative block">
            <img
              alt="profile"
              src={user.photoURL}
              className="mx-auto object-cover rounded-full h-24 w-24  border-2 border-white "
            />
          </a>

          <p className="p-2 px-4 text-xs text-black bg-lime-500 rounded-full">
            {role?.toUpperCase()}
          </p>
          <p className="mt-2 text-xl font-medium text-gray-800 ">
            User Id: {user.uid}
          </p>
          <div className="w-full p-2 mt-4 rounded-lg">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 ">
              <p className="flex flex-col">
                Name
                <span className="font-bold text-black ">
                  {user.displayName}
                </span>
              </p>
              <p className="flex flex-col">
                Email
                <span className="font-bold text-black ">{user.email}</span>
              </p>

              <div>
                <button className="bg-lime-500 px-10 py-1 rounded-lg text-black cursor-pointer hover:bg-lime-800 block mb-1">
                  Update Profile
                </button>
                <button className="bg-lime-500 px-7 py-1 rounded-lg text-black cursor-pointer hover:bg-lime-800">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
