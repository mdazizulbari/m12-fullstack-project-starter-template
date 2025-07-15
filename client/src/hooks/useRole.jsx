// import React, { useEffect, useState } from "react";
import useAxiosSecure from "./useAxiosSecure";
import useAuth from "./useAuth";
import { useQuery } from "@tanstack/react-query";

const useRole = () => {
  const { user, loading } = useAuth();
  // const [role, setRole] = useState(null);
  // const [isRoleLoading, setIsRoleLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  const { data: role, isLoading: isRoleLoading } = useQuery({
    queryKey: ["role", user?.email],
    enabled: !loading && !!user?.email, // need a boolean value
    queryFn: async () => {
      const { data } = await axiosSecure(`/user/role/${user?.email}`);
      return data;
    },
  });
  console.log(role, isRoleLoading);

  // useEffect(() => {
  //   const fetchUserRole = async () => {
  //     if (!user) return setIsRoleLoading(false);

  //     try {
  //       const { data } = await axiosSecure(
  //         `${import.meta.env.VITE_API_URL}/user/role/${user?.email}`
  //       );
  //       setRole(data?.role);
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setIsRoleLoading(false);
  //     }
  //   };
  //   fetchUserRole();
  // }, [user, axiosSecure]);

  return [role?.role, isRoleLoading];
};

export default useRole;
