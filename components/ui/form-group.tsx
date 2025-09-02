import { ReactNode } from 'react';

type FormGroupProps = {
  children: ReactNode;
};

const FormGroup = ({ children }: FormGroupProps) => <div className="relative flex items-center w-full">{children}</div>;

export default FormGroup;
