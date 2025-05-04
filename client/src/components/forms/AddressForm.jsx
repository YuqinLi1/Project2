import React, { useEffect } from "react";
import { Form, Row, Col } from "antd";
import { useForm, Controller } from "react-hook-form";
import Button from "../common/Button";
import Input from "../common/Input";

const AddressForm = ({ initialValues = {}, onSubmit, loading, onChange }) => {
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
        <Col span={12}>
          <Controller
            name="building"
            control={control}
            render={({ field }) => (
              <Input
                label="Building/Apt #"
                placeholder="Enter building or apt number"
                {...field}
              />
            )}
          />
        </Col>
        <Col span={12}>
          <Controller
            name="street"
            control={control}
            rules={{ required: "Street is required" }}
            render={({ field }) => (
              <Input
                label="Street"
                placeholder="Enter street name"
                error={errors.street?.message}
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
            name="city"
            control={control}
            rules={{ required: "City is required" }}
            render={({ field }) => (
              <Input
                label="City"
                placeholder="Enter city"
                error={errors.city?.message}
                required
                {...field}
              />
            )}
          />
        </Col>
        <Col span={8}>
          <Controller
            name="state"
            control={control}
            rules={{ required: "State is required" }}
            render={({ field }) => (
              <Input
                label="State"
                placeholder="Enter state"
                error={errors.state?.message}
                required
                {...field}
              />
            )}
          />
        </Col>
        <Col span={8}>
          <Controller
            name="zip"
            control={control}
            rules={{ required: "Zip code is required" }}
            render={({ field }) => (
              <Input
                label="Zip Code"
                placeholder="Enter zip code"
                error={errors.zip?.message}
                required
                {...field}
              />
            )}
          />
        </Col>
      </Row>

      <Form.Item style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Address
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddressForm;
