import React from "react";
import { PageHeader as AntPageHeader, Button } from "antd";
import { useNavigate } from "react-router-dom";

const PageHeader = ({
  title,
  subtitle,
  backButton = true,
  extra,
  onBack,
  ...rest
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <AntPageHeader
      title={title}
      subTitle={subtitle}
      onBack={backButton ? handleBack : undefined}
      extra={extra}
      {...rest}
    />
  );
};

export default PageHeader;
