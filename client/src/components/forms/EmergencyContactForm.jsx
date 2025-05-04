import React, { useEffect } from "react";
import { Form, Row, Col } from "antd";
import { useForm, Controller } from "react-hook-form";
import Button from "../common/Button";
import Input from "../common/Input";

const ContactForm = ({
  initialValues = {},
  onSubmit,
  loading,
  buttonText = "Save Contact",
  onChange,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  useEffect(() => {
    const subscription = watch((values) => {
      onChange && onChange(values);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);
  
  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Row gutter={16}>
        <Col span={8}>
          <Controller
            name="firstName"
            control={control}
            rules={{ required: "First name is required" }}
            render={({ field }) => (
              <Input
                label="First Name"
                placeholder="Enter first name"
                error={errors.firstName?.message}
                required
                {...field}
              />
            )}
          />
        </Col>
        <Col span={8}>
          <Controller
            name="middleName"
            control={control}
            render={({ field }) => (
              <Input
                label="Middle Name"
                placeholder="Enter middle name (optional)"
                {...field}
              />
            )}
          />
        </Col>
        <Col span={8}>
          <Controller
            name="lastName"
            control={control}
            rules={{ required: "Last name is required" }}
            render={({ field }) => (
              <Input
                label="Last Name"
                placeholder="Enter last name"
                error={errors.lastName?.message}
                required
                {...field}
              />
            )}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Controller
            name="phone"
            control={control}
            rules={{ required: "Phone number is required" }}
            render={({ field }) => (
              <Input
                label="Phone"
                placeholder="Enter phone number"
                error={errors.phone?.message}
                required
                {...field}
              />
            )}
          />
        </Col>
        <Col span={8}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <Input
                label="Email"
                placeholder="Enter email"
                error={errors.email?.message}
                required
                {...field}
              />
            )}
          />
        </Col>
        <Col span={8}>
          <Controller
            name="relationship"
            control={control}
            rules={{ required: "Relationship is required" }}
            render={({ field }) => (
              <Input
                label="Relationship"
                placeholder="Enter relationship"
                error={errors.relationship?.message}
                required
                {...field}
              />
            )}
          />
        </Col>
      </Row>

      <Form.Item style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {buttonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContactForm;
