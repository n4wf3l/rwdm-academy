export interface FormProps {
  formData: Record<string, any>;
  onFormDataChange: (key: string, value: any) => void;
  preselectedAcademy?: string;
  disableAcademy?: boolean;
}
