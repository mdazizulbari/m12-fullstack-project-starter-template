import AdminStatistics from "../../../components/Dashboard/Statistics/AdminStatistics";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import useRole from "../../../hooks/useRole";
import CustomerStatistics from "../Customer/CustomerStatistics";
import SellerStatistics from "../Seller/SellerStatistics";

const Statistics = () => {
  const [role, isRoleLoading] = useRole();
  if (isRoleLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Welcome to Dashboard</h1>
      {role === "admin" && <AdminStatistics />}
      {role === "seller" && <SellerStatistics />}
      {role === "customer" && <CustomerStatistics />}
    </div>
  );
};

export default Statistics;
