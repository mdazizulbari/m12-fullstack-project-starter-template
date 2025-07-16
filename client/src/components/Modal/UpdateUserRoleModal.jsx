import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const UpdateUserRoleModal = ({
  isOpen,
  refetch,
  setIsOpen,
  role,
  userEmail,
}) => {
  const axiosSecure = useAxiosSecure();
  const [updatedRole, setUpdatedRole] = useState(role);
  function close() {
    setIsOpen(false);
  }

  // get data === useQuery
  // update/add/delete === useMutation
  const mutation = useMutation({
    mutationFn: async (role) => {
      const { data } = await axiosSecure.patch(
        `/user/role/update/${userEmail}`,
        { role }
      );
      return data;
    },
    onSuccess: (data) => {
      console.log(data);
      refetch();
      toast.success("User role updated successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(updatedRole);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl shadow-2xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle
                as="h3"
                className="text-base/7 font-medium text-black"
              >
                Update User Role
              </DialogTitle>
              <form action="" onSubmit={handleSubmit}>
                <div className="">
                  <select
                    value={updatedRole}
                    onChange={(e) => setUpdatedRole(e.target.vale)}
                    name="role"
                    id=""
                    className="w-full rounded-2xl my-3 border border-gray-200 px-2 py-3"
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-between mt-5">
                  <button
                    type="button"
                    onClick={close}
                    className="btn btn-error"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-success btn">
                    Update
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default UpdateUserRoleModal;
