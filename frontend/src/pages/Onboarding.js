import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Form,
  Grid,
  Segment,
  Radio,
  Button,
  Header,
  Divider,
  Message,
  Dropdown,
} from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  setStatus,
  setRejectReason,
  setFormData,
  updateFormField,
} from "../slices/onBoardingSlice.js";
import Navigator from "../component/Navigator.js";
import DocumentUpload from "../component/DocumentUpload.js";

const genderOptions = [
  { key: "m", text: "Male", value: "male" },
  { key: "f", text: "Female", value: "female" },
];

const stateOptions = [
  { key: "AL", value: "AL", text: "Alabama" },
  { key: "AK", value: "AK", text: "Alaska" },
  { key: "AZ", value: "AZ", text: "Arizona" },
  { key: "AR", value: "AR", text: "Arkansas" },
  { key: "CA", value: "CA", text: "California" },
  { key: "CO", value: "CO", text: "Colorado" },
  { key: "CT", value: "CT", text: "Connecticut" },
  { key: "DE", value: "DE", text: "Delaware" },
  { key: "DC", value: "DC", text: "District of Columbia" },
  { key: "FL", value: "FL", text: "Florida" },
  { key: "GA", value: "GA", text: "Georgia" },
  { key: "HI", value: "HI", text: "Hawaii" },
  { key: "ID", value: "ID", text: "Idaho" },
  { key: "IL", value: "IL", text: "Illinois" },
  { key: "IN", value: "IN", text: "Indiana" },
  { key: "IA", value: "IA", text: "Iowa" },
  { key: "KS", value: "KS", text: "Kansas" },
  { key: "KY", value: "KY", text: "Kentucky" },
  { key: "LA", value: "LA", text: "Louisiana" },
  { key: "ME", value: "ME", text: "Maine" },
  { key: "MD", value: "MD", text: "Maryland" },
  { key: "MA", value: "MA", text: "Massachusetts" },
  { key: "MI", value: "MI", text: "Michigan" },
  { key: "MN", value: "MN", text: "Minnesota	" },
  { key: "MS", value: "MS", text: "Mississippi" },
  { key: "MO", value: "MO", text: "Missouri" },
  { key: "MT", value: "MT", text: "Montana" },
  { key: "NE", value: "NE", text: "Nebraska" },
  { key: "NV", value: "NV", text: "Nevada" },
  { key: "NH", value: "NH", text: "New Hampshire" },
  { key: "NJ", value: "NJ", text: "New Jersey" },
  { key: "NM", value: "NM", text: "New Mexico" },
  { key: "NY", value: "NY", text: "New York" },
  { key: "NC", value: "NC", text: "North Carolina" },
  { key: "ND", value: "ND", text: "North Dakota" },
  { key: "OH", value: "OH", text: "Ohio" },
  { key: "OK", value: "OK", text: "Oklahoma" },
  { key: "OR", value: "OR", text: "Oregon" },
  { key: "PA", value: "PA", text: "Pennsylvania" },
  { key: "RI", value: "RI", text: "Rhode Island" },
  { key: "SC", value: "SC", text: "South Carolina" },
  { key: "SD", value: "SD", text: "South Dakota" },
  { key: "TN", value: "TN", text: "Tennessee" },
  { key: "TX", value: "TX", text: "Texas" },
  { key: "UT", value: "UT", text: "Utah" },
  { key: "VT", value: "VT", text: "Vermont" },
  { key: "VA", value: "VA", text: "Virginia" },
  { key: "WA", value: "WA", text: "Washington" },
  { key: "WV", value: "WV", text: "West Virginia" },
  { key: "WI", value: "WI", text: "Wisconsin" },
  { key: "WY", value: "WY", text: "Wyoming" },
];

const visaOptions = [
  { key: "h1b", text: "H1-B", value: "H1-B" },
  { key: "l2", text: "L2", value: "L2" },
  { key: "f1", text: "F1(CPT/OPT)", value: "F1(CPT/OPT)" },
  { key: "h4", text: "H4", value: "H4" },
  { key: "other", text: "Other", value: "Other" },
];

const Onboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [unauthorized, setUnauthorized] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [email, setEmail] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const formData = useSelector((state) => state.onboarding.formData);
  const status = useSelector((state) => state.onboarding.status);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUnauthorized(true);
      return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded.id;
    const emailFromToken = decoded.email || decoded.username || "";
    setEmail(emailFromToken);

    axios
      .get(`http://localhost:5000/api/employee/status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const status = res.data.status;
        dispatch(setStatus(status));
        if (status === "never submit") {
          dispatch(setFormData({ email: emailFromToken }));
          setReadOnly(false);
        } else if (status === "pending") {
          setAlertMessage("Your application is being reviewed.");
          setReadOnly(true);
          fetchProfile(token);
        } else if (status === "rejected") {
          setAlertMessage(
            "Your application was rejected. Please review and resubmit."
          );
          setReadOnly(false);
          fetchProfile(token);
        }
      })
      .catch(() => {
        setUnauthorized(true);
      });
  }, [dispatch]);

  const fetchProfile = async (token, userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/employee/profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setFormData(res.data.data)); // ✅ adjust if response shape includes .data
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      const decoded = jwtDecode(token);
      const currentUserId = decoded.id;
      const payload = {
        userId: currentUserId,
        email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        preferedName: formData.preferedName,
        ssn: formData.ssn,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        currentAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        contactInfo: {
          cellPhone: formData.phone,
        },
        isPermanentResident: formData.isPermanentResident,
        greenCardStatus: formData.greenCardStatus,
        visaType: formData.visaType,
        otherVisaTitle: formData.otherVisaTitle,
        visaStartDate: formData.visaStartDate,
        visaEndDate: formData.visaEndDate,
        reference: {
          firstName: formData.referenceFirstName,
          middleName: formData.referenceMiddleName,
          lastName: formData.referenceLastName,
          phone: formData.referencePhone,
          email: formData.referenceEmail,
          relationship: formData.referenceRelationship,
        },
        emergencyContacts: [
          {
            firstName: formData.emergencyFirstName,
            middleName: formData.emergencyMiddleName,
            lastName: formData.emergencyLastName,
            phone: formData.emergencyPhone,
            email: formData.emergencyEmail,
            relationship: formData.emergencyRelationship,
          },
        ],
      };

      const res = await axios.post(
        "http://localhost:5000/api/employee",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const employeeId = res.data.employeeId;
      const docTypes = [
        { field: "Profile", type: "Profile Picture" },
        { field: "license", type: "Driver's License" },
        { field: "authorization", type: "Work Authorization" },
      ];

      if (formData.visaType === "F1(CPT/OPT)") {
        docTypes.unshift({ field: "OPTReceipt", type: "OPT Receipt" });
      }

      for (const { field, type } of docTypes) {
        const file = document.getElementById(`file-${field}`)?.files[0];
        if (file) {
          const form = new FormData();
          form.append("file", file);
          form.append("employeeId", employeeId);
          form.append("documentType", type); // send correct label here
          await axios.post(
            "http://localhost:5000/api/documents/upload-single",
            form,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }

      window.alert("Submission successful and waiting for review");
      navigate("/dashboard");
    } catch (err) {
      console.error("Submission error", err);
      window.alert("Submission failed. Rolling back...");

      try {
        await axios.delete(`http://localhost:5000/api/employee/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}

      try {
        await axios.delete(
          `http://localhost:5000/api/documents/employee/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch {}

      // Reset form fields in Redux
      dispatch(setFormData({}));

      // Clear file inputs manually
      const docTypes = ["Profile", "license", "authorization", "OPTReceipt"];
      for (const type of docTypes) {
        const input = document.getElementById(`file-${type}`);
        if (input) input.value = "";
      }

      // ✅ Force refresh the page to re-trigger useEffect and clear local state
      window.location.reload();
    }
  };

  if (unauthorized) {
    return <Message negative content="401 Unauthorized: Please login first." />;
  }

  return (
    <Container>
      <Navigator />
      <Header as="h2" textAlign="center">
        Onboarding Application
      </Header>
      {alertMessage && <Message warning>{alertMessage}</Message>}
      <Segment>
        <Form>
          <Form.Input label="Email" value={email} readOnly />
          <Form.Input
            label="First Name"
            value={formData.firstName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({ field: "firstName", value: e.target.value })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Last Name"
            value={formData.lastName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({ field: "lastName", value: e.target.value })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Middle Name"
            value={formData.middleName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({ field: "middleName", value: e.target.value })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Prefered Name"
            value={formData.preferedName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "preferedName",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="SSN"
            value={formData.ssn || ""}
            onChange={(e) =>
              dispatch(updateFormField({ field: "ssn", value: e.target.value }))
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Phone Number"
            value={formData.phone || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({ field: "phone", value: e.target.value })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Date of Birth"
            type="date"
            value={formData.dob || ""}
            onChange={(e) =>
              dispatch(updateFormField({ field: "dob", value: e.target.value }))
            }
            readOnly={readOnly}
          />
          <Form.Field>
            <label>Gender</label>
            <Dropdown
              fluid
              selection
              options={genderOptions}
              value={formData.gender || ""}
              onChange={(e, { value }) =>
                dispatch(updateFormField({ field: "gender", value }))
              }
              disabled={readOnly}
            />
          </Form.Field>
          <Form.Input
            label="Address"
            value={formData.address || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({ field: "address", value: e.target.value })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="City"
            value={formData.city || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({ field: "city", value: e.target.value })
              )
            }
            readOnly={readOnly}
          />
          <Form.Field>
            <label>State</label>
            <Dropdown
              fluid
              selection
              options={stateOptions}
              value={formData.state || ""}
              onChange={(e, { value }) =>
                dispatch(updateFormField({ field: "state", value }))
              }
              disabled={readOnly}
            />
          </Form.Field>
          <Form.Input
            label="Zip Code"
            value={formData.zip || ""}
            onChange={(e) =>
              dispatch(updateFormField({ field: "zip", value: e.target.value }))
            }
            readOnly={readOnly}
          />
          <Header as="h4">
            Reference (who referred you to this company? There can only be 1)
          </Header>
          <Form.Input
            label="Reference First Name"
            value={formData.referenceFirstName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "referenceFirstName",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Reference Middle Name"
            value={formData.referenceMiddleName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "referenceMiddleName",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Reference Last Name"
            value={formData.referenceLastName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "referenceLastName",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Reference Phone"
            value={formData.referencePhone || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "referencePhone",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Reference Email"
            value={formData.referenceEmail || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "referenceEmail",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Reference Relationship"
            value={formData.referenceRelationship || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "referenceRelationship",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />

          <Form.Checkbox
            label="Is Emergency Contact same as Reference?"
            checked={formData.sameAsReference || false}
            onChange={(e, { checked }) => {
              dispatch(
                updateFormField({ field: "sameAsReference", value: checked })
              );
              if (checked) {
                dispatch(
                  updateFormField({
                    field: "emergencyFirstName",
                    value: formData.referenceFirstName,
                  })
                );
                dispatch(
                  updateFormField({
                    field: "emergencyMiddleName",
                    value: formData.referenceMiddleName,
                  })
                );
                dispatch(
                  updateFormField({
                    field: "emergencyLastName",
                    value: formData.referenceLastName,
                  })
                );
                dispatch(
                  updateFormField({
                    field: "emergencyPhone",
                    value: formData.referencePhone,
                  })
                );
                dispatch(
                  updateFormField({
                    field: "emergencyEmail",
                    value: formData.referenceEmail,
                  })
                );
                dispatch(
                  updateFormField({
                    field: "emergencyRelationship",
                    value: formData.referenceRelationship,
                  })
                );
              }
            }}
            disabled={readOnly}
          />

          <Header as="h4">Emergency Contact</Header>
          <Form.Input
            label="Emergency First Name"
            value={formData.emergencyFirstName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "emergencyFirstName",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Emergency Middle Name"
            value={formData.emergencyMiddleName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "emergencyMiddleName",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Emergency Last Name"
            value={formData.emergencyLastName || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "emergencyLastName",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Emergency Phone"
            value={formData.emergencyPhone || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "emergencyPhone",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Emergency Email"
            value={formData.emergencyEmail || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "emergencyEmail",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />
          <Form.Input
            label="Emergency Relationship"
            value={formData.emergencyRelationship || ""}
            onChange={(e) =>
              dispatch(
                updateFormField({
                  field: "emergencyRelationship",
                  value: e.target.value,
                })
              )
            }
            readOnly={readOnly}
          />

          <Header as="h4">Visa Information</Header>
          <Form.Field>
            <label>Are you a permanent resident or citizen of the U.S.?</label>
            <Dropdown
              fluid
              selection
              options={[
                { key: "yes", text: "Yes", value: "yes" },
                { key: "no", text: "No", value: "no" },
              ]}
              value={formData.isPermanentResident || ""}
              onChange={(e, { value }) => {
                dispatch(
                  updateFormField({ field: "isPermanentResident", value })
                );
                if (value === "yes") {
                  dispatch(
                    updateFormField({ field: "visaStartDate", value: "" })
                  );
                  dispatch(
                    updateFormField({ field: "visaEndDate", value: "" })
                  );
                  dispatch(updateFormField({ field: "visaType", value: "" }));
                  dispatch(
                    updateFormField({ field: "otherVisaTitle", value: "" })
                  );
                }
              }}
              disabled={readOnly}
            />
          </Form.Field>

          {formData.isPermanentResident === "yes" && (
            <Form.Field>
              <label>Status</label>
              <Dropdown
                fluid
                selection
                options={[
                  { key: "greenCard", text: "Green Card", value: "Green Card" },
                  { key: "citizen", text: "Citizen", value: "Citizen" },
                ]}
                value={formData.greenCardStatus || ""}
                onChange={(e, { value }) =>
                  dispatch(updateFormField({ field: "greenCardStatus", value }))
                }
                disabled={readOnly}
              />
            </Form.Field>
          )}

          {formData.isPermanentResident === "no" && (
            <>
              <Form.Field>
                <label>What is your work authorization?</label>
                <Dropdown
                  fluid
                  selection
                  options={visaOptions}
                  value={formData.visaType || ""}
                  onChange={(e, { value }) =>
                    dispatch(updateFormField({ field: "visaType", value }))
                  }
                  disabled={readOnly}
                />
              </Form.Field>

              {formData.visaType === "Other" && (
                <Form.Input
                  label="Please specify your visa title"
                  value={formData.otherVisaTitle || ""}
                  onChange={(e) =>
                    dispatch(
                      updateFormField({
                        field: "otherVisaTitle",
                        value: e.target.value,
                      })
                    )
                  }
                  readOnly={readOnly}
                />
              )}
            </>
          )}

          {formData.isPermanentResident !== "yes" && (
            <>
              <Form.Input
                label="Start Date"
                type="date"
                value={formData.visaStartDate || ""}
                onChange={(e) =>
                  dispatch(
                    updateFormField({
                      field: "visaStartDate",
                      value: e.target.value,
                    })
                  )
                }
                readOnly={readOnly}
              />
              <Form.Input
                label="End Date"
                type="date"
                value={formData.visaEndDate || ""}
                onChange={(e) =>
                  dispatch(
                    updateFormField({
                      field: "visaEndDate",
                      value: e.target.value,
                    })
                  )
                }
                readOnly={readOnly}
              />
            </>
          )}

          <Header as="h4">Document Upload</Header>

          {formData.visaType === "F1(CPT/OPT)" && (
            <DocumentUpload
              employeeId={userId}
              documentTitle="OPT Receipt"
              documentType="OPTReceipt"
              mode={status}
            />
          )}

          <DocumentUpload
            employeeId={userId}
            documentTitle="Profile Picture"
            documentType="Profile"
            mode={status}
          />

          <DocumentUpload
            employeeId={userId}
            documentTitle="Driver’s License"
            documentType="license"
            mode={status}
          />

          <DocumentUpload
            employeeId={userId}
            documentTitle="Work Authorization"
            documentType="authorization"
            mode={status}
          />
          {(status === "never submit" || status === "rejected") && (
            <Button primary onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </Form>
      </Segment>
    </Container>
  );
};

export default Onboarding;
