import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

const UpdateUserRoleModal = () => {
  let [isOpen, setIsOpen] = useState(true);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Button
        onClick={open}
        className="rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-black/30"
      >
        Open dialog
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
        __demoMode
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
              <form action="">
                <select
                  name="role"
                  id=""
                  className="w-full rounded-2xl my-3 border border-gray-200 px-2 py-3"
                >
                  <option value="customer">Customer</option>
                  <option value="seller">seller</option>
                  <option value="admin">admin</option>
                </select>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default UpdateUserRoleModal;
