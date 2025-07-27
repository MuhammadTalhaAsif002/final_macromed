import axios from "axios";
import config from "constants/config";
import Errors from "../../components/admin/FormItems/error/errors";
import { toast } from "react-toastify";

const actions = {
  doChangePassword: ({ newPassword, currentPassword }) => async (dispatch) => {
    try {
      dispatch({
        type: "USERS_FORM_CREATE_STARTED",
      });
      await axios.put(`${config.baseURLApi}/password-update`, {
        newPassword,
        currentPassword,
      });
      dispatch({
        type: "USERS_FORM_UPDATE_SUCCESS",
      });

      toast.success("Password has been updated");
      if (typeof window !== 'undefined') { window.location.href = "/shop" }
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "USERS_FORM_CREATE_ERROR",
      });
    }
  },
};

export default actions;
