import SwalLegacy from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Loading from "../components/Loading";

const Swal = withReactContent(SwalLegacy);

export const createModal = ({ title, html, width, onClose }) => {
  width = width ?? 600;
  Swal.fire({
    title: title ? <strong>{title}</strong> : null,
    html,
    showCloseButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    showCancelButton: false,
    width,
    didDestroy: () => {
      if (onClose) onClose();
    },
  });
};

export const createDeleteQuestion = (key, onConfirm) => {
  Swal.fire({
    title: "Are you sure?",
    html: (
      <>
        Will delete <b>{key}</b>, you won't be able to revert this!
      </>
    ),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "var(--color-danger)",
    cancelButtonColor: "var(--color-info-dark)",
    confirmButtonText: "Yes, delete!",
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};

/**
 * @param {('success'|'error'|'warning'|'info'|'question')} icon
 * @param {string} message
 * @param {number} timer
 */
export const createPopup = async (icon, message, timer = 5000) => {
  Swal.fire({
    title: message,
    icon,
    timer,
    timerProgressBar: true,
  });
};

export const closeModal = () => {
  Swal.close();
};

export const showLoading = () => {
  Swal.fire({
    title: "Processing...",
    html: <Loading type={"spin"} color={"#ccc"} width={30} />,
    showCloseButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    showCancelButton: false,
  });
};
