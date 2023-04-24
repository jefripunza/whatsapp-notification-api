import SwalLegacy from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Swal = withReactContent(SwalLegacy);

export const createModal = ({ title, html, width }) => {
  width = width ?? 600;
  Swal.fire({
    title: title ? <strong>{title}</strong> : null,
    html,
    showCloseButton: true,
    showConfirmButton: false,
    showCancelButton: false,
    width,
  });
};

export const createPopup = async (icon, message, timer = 5000) => {
  Swal.fire({
    title: message,
    icon: icon,
    timer,
    timerProgressBar: true,
  });
};

export const closeModal = () => {
  Swal.close();
};

export const showLoading = () => {
  //
};
