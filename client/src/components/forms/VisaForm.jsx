import React, { useState } from "react";
import {
  Form,
  Row,
  Col,
  Radio,
  Select,
  DatePicker,
  Upload,
  Button as AntButton,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import Button from "../common/Button";
import Input from "../common/Input";

const { Option } = Select;
const { RangePicker } = DatePicker;

const VisaForm = ({ initialValues = {}, onSubmit, loading }) => {
  const [isPermanentResident, setIsPermanentResident] = useState(
    initialValues.isPermanentResident !== undefined
      ? initialValues.isPermanentResident
      : false
  );
  const [visaType, setVisaType] = useState(initialValues.visaType || null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...initialValues,
      startDate: initialValues.startDate
        ? moment(initialValues.startDate)
        : null,
      endDate: initialValues.endDate ? moment(initialValues.endDate) : null,
    },
  });

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Row gutter={16}>
        <Col span={24}>
          <Controller
            name="isPermanentResident"
            control={control}
            rules={{ required: "Please select an option" }}
            render={({ field }) => (
              <Form.Item
                label="Are you a permanent resident or citizen of the U.S.?"
                required
                validateStatus={errors.isPermanentResident ? "error" : ""}
                help={errors.isPermanentResident?.message}
              >
                <Radio.Group
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setIsPermanentResident(e.target.value);
                  }}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </Form.Item>
            )}
          />
        </Col>
      </Row>

      {isPermanentResident ? (
        <Row gutter={16}>
          <Col span={24}>
            <Controller
              name="residencyType"
              control={control}
              rules={{ required: "Please select residency type" }}
              render={({ field }) => (
                <Form.Item
                  label="Residency Type"
                  required
                  validateStatus={errors.residencyType ? "error" : ""}
                  help={errors.residencyType?.message}
                >
                  <Radio.Group {...field}>
                    <Radio value="Green Card">Green Card</Radio>
                    <Radio value="Citizen">Citizen</Radio>
                  </Radio.Group>
                </Form.Item>
              )}
            />
          </Col>
        </Row>
      ) : (
        <>
          <Row gutter={16}>
            <Col span={24}>
              <Controller
                name="visaType"
                control={control}
                rules={{ required: "Please select visa type" }}
                render={({ field }) => (
                  <Form.Item
                    label="What is your work authorization?"
                    required
                    validateStatus={errors.visaType ? "error" : ""}
                    help={errors.visaType?.message}
                  >
                    <Select
                      placeholder="Select visa type"
                      {...field}
                      onChange={(value) => {
                        field.onChange(value);
                        setVisaType(value);
                      }}
                    >
                      <Option value="H1-B">H1-B</Option>
                      <Option value="L2">L2</Option>
                      <Option value="F1(CPT/OPT)">F1(CPT/OPT)</Option>
                      <Option value="H4">H4</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                )}
              />
            </Col>
          </Row>

          {visaType === "Other" && (
            <Row gutter={16}>
              <Col span={24}>
                <Controller
                  name="visaTitle"
                  control={control}
                  rules={{ required: "Please specify visa title" }}
                  render={({ field }) => (
                    <Input
                      label="Visa Title"
                      placeholder="Enter your visa title"
                      error={errors.visaTitle?.message}
                      required
                      {...field}
                    />
                  )}
                />
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={24}>
              <Controller
                name="visaDates"
                control={control}
                rules={{ required: "Please select start and end dates" }}
                render={({ field }) => (
                  <Form.Item
                    label="Start and End Date"
                    required
                    validateStatus={errors.visaDates ? "error" : ""}
                    help={errors.visaDates?.message}
                  >
                    <RangePicker
                      style={{ width: "100%" }}
                      format="MM/DD/YYYY"
                      {...field}
                    />
                  </Form.Item>
                )}
              />
            </Col>
          </Row>

          {visaType === "F1(CPT/OPT)" && (
            <Row gutter={16}>
              <Col span={24}>
                <Controller
                  name="optReceipt"
                  control={control}
                  rules={{ required: "Please upload your OPT Receipt" }}
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  render={({ field }) => (
                    <Form.Item
                      label="OPT Receipt"
                      required
                      validateStatus={errors.optReceipt ? "error" : ""}
                      help={errors.optReceipt?.message}
                    >
                      <Upload {...field} beforeUpload={() => false}>
                        <AntButton icon={<UploadOutlined />}>
                          Upload OPT Receipt
                        </AntButton>
                      </Upload>
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          )}
        </>
      )}

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Visa Information
        </Button>
      </Form.Item>
    </Form>
  );
};

export default VisaForm;
