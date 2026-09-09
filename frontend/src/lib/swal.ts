import Swal from 'sweetalert2';

export const showToast = (message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  Toast.fire({
    icon,
    title: message,
  });
};

export const successAlert = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    customClass: {
      popup: 'hrms-swal',
      confirmButton: 'hrms-btn-primary',
    },
    confirmButtonText: 'Great, Continue',
    buttonsStyling: false,
  });
};

export const errorAlert = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text: text || 'An unexpected error occurred. Please try again.',
    icon: 'error',
    customClass: {
      popup: 'hrms-swal',
      confirmButton: 'hrms-btn-primary',
    },
    confirmButtonText: 'Dismiss',
    buttonsStyling: false,
  });
};

export const confirmDialog = async (
  title: string,
  text: string,
  confirmButtonText = 'Yes, Proceed',
  icon: 'warning' | 'question' | 'info' = 'warning'
) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'hrms-swal',
      confirmButton: 'hrms-btn-primary',
      cancelButton: 'hrms-btn-secondary ml-3',
    },
    buttonsStyling: false,
    reverseButtons: true,
  });
};

export const deleteConfirm = async (itemType = 'record') => {
  return confirmDialog(
    `Delete ${itemType}?`,
    'This action is irreversible. All related data will be archived or removed.',
    'Yes, Delete It',
    'warning'
  );
};
