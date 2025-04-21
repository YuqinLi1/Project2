import React from "react";
import { Form, Row, Col, Card, Divider, DatePicker, Select } from "antd";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import Button from "../common/Button";
import Input from "../common/Input";

const { Option } = Select;

const PersonalInfoForm = ({ initialValues = {}, onSubmit, loading }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...initialValues,
      dateOfBirth: initialValues.dateOfBirth
        ? moment(initialValues.dateOfBirth)
        : null,
    },
  });

  return (
    <Card title="Personal Information">
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
          <Col span={12}>
            <Controller
              name="preferredName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Preferred Name"
                  placeholder="Enter preferred name (optional)"
                  {...field}
                />
              )}
            />
          </Col>
          <Col span={12}>
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
                  disabled
                  {...field}
                />
              )}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Controller
              name="ssn"
              control={control}
              rules={{ required: "SSN is required" }}
              render={({ field }) => (
                <Input
                  label="SSN"
                  placeholder="Enter SSN"
                  error={errors.ssn?.message}
                  required
                  {...field}
                />
              )}
            />
          </Col>
          <Col span={8}>
            <Controller
              name="dateOfBirth"
              control={control}
              rules={{ required: "Date of birth is required" }}
              render={({ field }) => (
                <Form.Item
                  label="Date of Birth"
                  required
                  validateStatus={errors.dateOfBirth ? "error" : ""}
                  help={errors.dateOfBirth?.message}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select date of birth"
                    format="MM/DD/YYYY"
                    {...field}
                  />
                </Form.Item>
              )}
            />
          </Col>
          <Col span={8}>
            <Controller
              name="gender"
              control={control}
              rules={{ required: "Gender is required" }}
              render={({ field }) => (
                <Form.Item
                  label="Gender"
                  required
                  validateStatus={errors.gender ? "error" : ""}
                  help={errors.gender?.message}
                >
                  <Select placeholder="Select gender" {...field}>
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="i do not wish to answer">
                      I do not wish to answer
                    </Option>
                  </Select>
                </Form.Item>
              )}
            />
          </Col>
        </Row>

        <Divider>Address Information</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Controller
              name="currentAddress.building"
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
              name="currentAddress.street"
              control={control}
              rules={{ required: "Street is required" }}
              render={({ field }) => (
                <Input
                  label="Street"
                  placeholder="Enter street name"
                  error={errors.currentAddress?.street?.message}
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
              name="currentAddress.city"
              control={control}
              rules={{ required: "City is required" }}
              render={({ field }) => (
                <Input
                  label="City"
                  placeholder="Enter city"
                  error={errors.currentAddress?.city?.message}
                  required
                  {...field}
                />
              )}
            />
          </Col>
          <Col span={8}>
            <Controller
              name="currentAddress.state"
              control={control}
              rules={{ required: "State is required" }}
              render={({ field }) => (
                <Input
                  label="State"
                  placeholder="Enter state"
                  error={errors.currentAddress?.state?.message}
                  required
                  {...field}
                />
              )}
            />
          </Col>
          <Col span={8}>
            <Controller
              name="currentAddress.zip"
              control={control}
              rules={{ required: "Zip code is required" }}
              render={({ field }) => (
                <Input
                  label="Zip Code"
                  placeholder="Enter zip code"
                  error={errors.currentAddress?.zip?.message}
                  required
                  {...field}
                />
              )}
            />
          </Col>
        </Row>

        <Divider>Contact Information</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Controller
              name="contactInfo.cellPhone"
              control={control}
              rules={{ required: "Cell phone number is required" }}
              render={({ field }) => (
                <Input
                  label="Cell Phone"
                  placeholder="Enter cell phone number"
                  error={errors.contactInfo?.cellPhone?.message}
                  required
                  {...field}
                />
              )}
            />
          </Col>
          <Col span={12}>
            <Controller
              name="contactInfo.workPhone"
              control={control}
              render={({ field }) => (
                <Input
                  label="Work Phone"
                  placeholder="Enter work phone number (optional)"
                  {...field}
                />
              )}
            />
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Information
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PersonalInfoForm;
