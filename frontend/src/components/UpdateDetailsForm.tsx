// src/components/UpdateDetailsForm.tsx
import React, { useState, useEffect } from "react";
import { useStudentStore } from "../store/studentStore";
import { updateStudentData } from "../services/api";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateDetailsSchema, UpdateDetailsInput } from "../validation/schemas";
import { isEqual } from "lodash";

// Field of study options with BTech Computer merged
const FIELD_OPTIONS = [
  "BTech Computer", // Merged field
  "Engineering",
  "Medicine",
  "Arts",
  "Science",
  "Commerce",
  "Law",
];

// Input format guidelines
const INPUT_GUIDELINES = {
  name: "Full name as per official records",
  date_of_birth: "Format: YYYY-MM-DD",
  mobile_number: "10-digit mobile number without country code",
  email: "Valid email address (e.g., example@domain.com)",
  father_mobile_number: "10-digit mobile number without country code",
  address: "Complete address with city, state and PIN code",
  taluka: "Taluka/Tehsil name",
  city: "City name", // New city guideline
  district: "District name",
  pincode: "6-digit pincode",
};

interface UpdateDetailsFormProps {
  onCancel: () => void;
  onUpdate: () => void;
}

const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({
  onCancel,
  onUpdate,
}) => {
  const student = useStudentStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Default values from the store
  const defaultValues = {
    roll_no: student.roll_no || "",
    name: student.name || "",
    date_of_birth: student.date_of_birth
      ? student.date_of_birth.split("T")[0]
      : "",
    mobile_number: student.mobile_number || "",
    email: student.email || "",
    father_mobile_number: student.father_mobile_number || "",
    field_of_study: student.field_of_study || "",
    // branch is removed
    address: student.address || "",
    taluka: student.taluka || "",
    city: student.city || "", // New city field
    district: student.district || "",
    pincode: student.pincode || "",
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateDetailsInput>({
    resolver: zodResolver(updateDetailsSchema),
    defaultValues,
  });

  // Watch form values for changes
  const formValues = watch();

  // Check if there are any actual changes in the data
  useEffect(() => {
    // Filter out roll_no since it's read-only
    const { roll_no, ...currentValues } = formValues;
    const { roll_no: origRoll, ...originalValues } = defaultValues;

    setHasChanges(!isEqual(currentValues, originalValues));
  }, [formValues, defaultValues]);

  const onSubmit = async (data: UpdateDetailsInput) => {
    // If no changes, show message and return
    if (!hasChanges) {
      setSuccess("No changes detected in your data.");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedData = await updateStudentData(student.roll_no, data);

      // Check if mobile number was changed
      const mobileChanged = data.mobile_number !== student.mobile_number;

      student.setStudentData({
        ...updatedData,
        is_data_verified: false,
        is_mobile_verified: !mobileChanged && student.is_mobile_verified,
      });

      setSuccess("Your details have been updated successfully.");

      // Give user time to see success message before continuing
      setTimeout(() => {
        onUpdate();
      }, 1500);
    } catch (err: any) {
      console.error("Failed to update data:", err);
      setError(err.response?.data?.error || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <Alert
              variant="default"
              className="bg-blue-50 border-blue-200 flex flex-col sm:flex-row sm:items-center gap-2"
            >
              <div className="flex items-center">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mr-2" />
                <AlertDescription className="text-blue-700">
                  Please enter information accurately as per official records.
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="text-blue-600 hover:text-blue-800 mt-2 sm:mt-0 sm:ml-auto px-3"
              >
                {showGuidelines ? "Hide Guidelines" : "View Guidelines"}
              </Button>
            </Alert>

            {showGuidelines && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border animate-fadeIn">
                <h3 className="font-medium mb-2 text-gray-700">
                  Input Guidelines:
                </h3>
                <ul className="text-sm space-y-2 text-gray-600">
                  {Object.entries(INPUT_GUIDELINES).map(
                    ([field, guideline]) => (
                      <li
                        key={field}
                        className="flex flex-col sm:flex-row sm:gap-2"
                      >
                        <span className="font-medium text-gray-700">
                          {field
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          :
                        </span>
                        <span>{guideline}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="roll_no" className="text-gray-700">
                  Roll No
                </Label>
                <Input
                  id="roll_no"
                  {...register("roll_no")}
                  readOnly
                  className="bg-gray-50 focus:border-blue-300"
                />
                {errors.roll_no && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.roll_no.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Name
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="focus:border-blue-300"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="focus:border-blue-300"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_number" className="text-gray-700">
                  Mobile Number
                </Label>
                <Input
                  id="mobile_number"
                  type="tel"
                  {...register("mobile_number")}
                  className="focus:border-blue-300"
                />
                {errors.mobile_number && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.mobile_number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-gray-700">
                  Date of Birth
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register("date_of_birth")}
                  className="focus:border-blue-300"
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_mobile_number" className="text-gray-700">
                  Father's Mobile Number
                </Label>
                <Input
                  id="father_mobile_number"
                  type="tel"
                  {...register("father_mobile_number")}
                  className="focus:border-blue-300"
                />
                {errors.father_mobile_number && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.father_mobile_number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="field_of_study" className="text-gray-700">
                  Field of Study
                </Label>
                <Controller
                  name="field_of_study"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="focus:border-blue-300">
                        <SelectValue placeholder="Select field of study" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map((fieldOption) => (
                          <SelectItem key={fieldOption} value={fieldOption}>
                            {fieldOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.field_of_study && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.field_of_study.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taluka" className="text-gray-700">
                  Taluka
                </Label>
                <Input
                  id="taluka"
                  {...register("taluka")}
                  className="focus:border-blue-300"
                />
                {errors.taluka && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.taluka.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700">
                  City
                </Label>
                <Input
                  id="city"
                  {...register("city")}
                  className="focus:border-blue-300"
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="text-gray-700">
                  District
                </Label>
                <Input
                  id="district"
                  {...register("district")}
                  className="focus:border-blue-300"
                />
                {errors.district && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.district.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode" className="text-gray-700">
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  {...register("pincode")}
                  className="focus:border-blue-300"
                />
                {errors.pincode && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.pincode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-gray-700">
                  Address
                </Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  rows={3}
                  className="focus:border-blue-300"
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert
                variant="default"
                className="bg-green-50 text-green-800 border-green-200"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || (!hasChanges && isDirty)}
                className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading
                  ? "Saving..."
                  : !hasChanges
                  ? "No Changes"
                  : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateDetailsForm;
