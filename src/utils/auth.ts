// src/utils/auth.ts
export const login = (email: string) => {
    localStorage.setItem('userRole', email);
  };
  
  export const logout = () => {
    localStorage.removeItem('userRole');
    window.location.href = '/'; // redireciona ao sair
  };
  
  export const getUserEmail = (): string | null => {
    return localStorage.getItem('userRole');
  };
  