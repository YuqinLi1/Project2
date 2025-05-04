import { useState } from "react";

const useForm = (initialValues = {}, validate = () => ({})) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Handle blur events for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    // Validate field on blur
    const fieldValidationErrors = validate(values);
    if (fieldValidationErrors[name]) {
      setErrors({
        ...errors,
        [name]: fieldValidationErrors[name],
      });
    }
  };

  // Handle form submission
  const handleSubmit = (onSubmit) => {
    // Return an async function
    return async (e) => {
      e.preventDefault();

      // Validate all fields before submission
      const validationErrors = validate(values);
      setErrors(validationErrors);

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // Submit if no errors
      if (Object.keys(validationErrors).length === 0) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error("Form submission error:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    };
  };

  // Reset form to initial state
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Set specific form values
  const setFormValues = (newValues) => {
    setValues({
      ...values,
      ...newValues,
    });
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
  };
};

export default useForm;
