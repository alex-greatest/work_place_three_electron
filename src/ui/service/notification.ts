import { notifications } from "@mantine/notifications";

export function showError(id: string, message: string, autoClose: number = 5000) {
    notifications.show({
        id: id,
        position: 'top-right',
        withCloseButton: true,
        autoClose: autoClose,
        title: "Ошибка",
        message: message,
        color: 'white',
        loading: false,
        styles: {
          description: { 
            color: "white" 
          },
          title: {
            color: 'white'
          },
          root: {
            backgroundColor: '#fa5252',
          },
        }
      });
}

export function showSuccess(id: string, message: string, autoClose: number = 5000) {
  notifications.show({
      id: id,
      position: 'top-right',
      withCloseButton: true,
      autoClose: autoClose,
      title: "Успешно",
      message: message,
      color: 'white',
      loading: false,
      styles: {
        description: { 
          color: "white" 
        },
        title: {
          color: 'white'
        },
        root: {
          backgroundColor: '#0bda51',
        },
      }
    });
}