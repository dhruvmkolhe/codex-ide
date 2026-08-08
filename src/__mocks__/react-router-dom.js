import React from 'react';

export const BrowserRouter = ({ children }) => <>{children}</>;
export const HashRouter = ({ children }) => <>{children}</>;
export const Routes = ({ children }) => <>{children}</>;
export const Route = ({ element }) => element;
export const Link = ({ to, children, ...props }) => (
  <a href={to} {...props}>
    {children}
  </a>
);
export const NavLink = ({ to, children, ...props }) => (
  <a href={to} {...props}>
    {children}
  </a>
);
export const Navigate = () => <div>Navigate</div>;
export const useParams = () => ({});
export const useNavigate = () => jest.fn();
export const useLocation = () => ({ pathname: '/' });
