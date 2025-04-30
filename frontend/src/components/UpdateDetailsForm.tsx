"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useStudentStore } from "../store/studentStore"
import { updateStudentData } from "../services/api"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Alert, AlertDescription } from "./ui/alert"
import { AlertCircle, CheckCircle2, Info, Search } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateDetailsSchema, type UpdateDetailsInput } from "../validation/schemas"
import { isEqual } from "lodash"

// Field of study options with BTech Computer merged
const FIELD_OPTIONS = [
  "BTech Computer", // Merged field
  "Engineering",
  "Medicine",
  "Arts",
  "Science",
  "Commerce",
  "Law",
]

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
}

// Define separate lists for districts and talukas
const DISTRICTS = [
  "Ahmedabad",
  "Amreli",
  "Anand",
  "Aravalli",
  "Banaskantha",
  "Bharuch",
  "Bhavnagar",
  "Botad",
  "Chhota Udepur",
  "Dahod",
  "Dang",
  "Devbhumi Dwarka",
  "Gandhinagar",
  "Gir Somnath",
  "Jamnagar",
  "Junagadh",
  "Kachchh",
  "Kheda",
  "Mahesana",
  "Mahisagar",
  "Morbi",
  "Narmada",
  "Navsari",
  "Panchmahal",
  "Patan",
  "Porbandar",
  "Rajkot",
  "Sabarkantha",
  "Surat",
  "Surendranagar",
  "Tapi",
  "Vadodara",
  "Valsad",
]

const TALUKAS = [
  "Ahmedabad City",
  "Daskroi",
  "Detroj-Rampura",
  "Dholka",
  "Dhandhuka",
  "Sanand",
  "Viramgam",
  "Bavla",
  "Amreli",
  "Lathi",
  "Lilia",
  "Savarkundla",
  "Khambha",
  "Jafrabad",
  "Rajula",
  "Bagasara",
  "Dhari",
  "Kunkavav",
  "Vadia",
  "Anand",
  "Petlad",
  "Sojitra",
  "Khambhat",
  "Borsad",
  "Anklav",
  "Tarapur",
  "Umreth",
  "Modasa",
  "Dhansura",
  "Malpur",
  "Meghraj",
  "Bayad",
  "Bhiloda",
  "Palanpur",
  "Vadgam",
  "Danta",
  "Amirgadh",
  "Dantiwada",
  "Deesa",
  "Dhanera",
  "Kankrej",
  "Tharad",
  "Vav",
  "Bharuch",
  "Amod",
  "Jambusar",
  "Jhagadia",
  "Ankleshwar",
  "Hansot",
  "Valia",
  "Bhavnagar",
  "Ghogha",
  "Sihor",
  "Palitana",
  "Umrala",
  "Gariadhar",
  "Mahuva",
  "Talaja",
  "Botad",
  "Barwala",
  "Gadhada",
  "Ranpur",
  "Chhota Udaipur",
  "Jetpur",
  "Pavi Bodeli",
  "Kavant",
  "Naswadi",
  "Sankheda",
  "Dahod",
  "Limkheda",
  "Zalod",
  "Garbada",
  "Dhanpur",
  "Devgad Baria",
  "Fatepura",
  "Ahwa",
  "Waghai",
  "Subir",
  "Khambhalia",
  "Bhanvad",
  "Kalyanpur",
  "Dwarka",
  "Gandhinagar",
  "Dehgam",
  "Mansa",
  "Kalol",
  "Veraval",
  "Kodinar",
  "Una",
  "Talala",
  "Sutrapada",
  "Gir Gadhada",
  "Jamnagar",
  "Kalavad",
  "Dhrol",
  "Jodiya",
  "Jamjodhpur",
  "Lalpur",
  "Junagadh",
  "Mangrol",
  "Manavadar",
  "Malia",
  "Visavadar",
  "Bhesan",
  "Vanthali",
  "Keshod",
  "Kheda",
  "Kapadvanj",
  "Mehmedabad",
  "Mahudha",
  "Matar",
  "Thasra",
  "Nadiad",
  "Vaso",
  "Galteshwar",
  "Bhuj",
  "Anjar",
  "Gandhidham",
  "Mandvi",
  "Mundra",
  "Nakhatrana",
  "Abdasa",
  "Lakhpat",
  "Rapar",
  "Lunawada",
  "Santrampur",
  "Kadana",
  "Khanpur",
  "Balasinor",
  "Virpur",
  "Mehsana",
  "Kadi",
  "Vijapur",
  "Visnagar",
  "Becharaji",
  "Satlasana",
  "Kheralu",
  "Unjha",
  "Morbi",
  "Tankara",
  "Wankaner",
  "Halvad",
  "Maliya",
  "Rajpipla",
  "Garudeshwar",
  "Nandod",
  "Sagbara",
  "Tilakwada",
  "Dediapada",
  "Navsari",
  "Jalalpore",
  "Gandevi",
  "Chikhli",
  "Khergam",
  "Vansda",
  "Godhra",
  "Lunawada",
  "Morwa Hadaf",
  "Shehera",
  "Khanpur",
  "Santrampur",
  "Halol",
  "Kalol",
  "Patan",
  "Siddhpur",
  "Chanasma",
  "Sami",
  "Harij",
  "Radhanpur",
  "Santalpur",
  "Porbandar",
  "Ranavav",
  "Kutiyana",
  "Rajkot",
  "Lodhika",
  "Jasdan",
  "Kotda Sangani",
  "Gondal",
  "Jetpur",
  "Dhoraji",
  "Paddhari",
  "Himatnagar",
  "Idar",
  "Khedbrahma",
  "Poshina",
  "Vadali",
  "Talod",
  "Prantij",
  "Bayad",
  "Surat City",
  "Choryasi",
  "Olpad",
  "Mandvi",
  "Mangrol",
  "Umarpada",
  "Bardoli",
  "Kamrej",
  "Mahuva",
  "Surendranagar",
  "Wadhwan",
  "Limbdi",
  "Chotila",
  "Sayla",
  "Thangadh",
  "Lakhtar",
  "Dhrangadhra",
  "Halvad",
  "Vyara",
  "Songadh",
  "Uchchhal",
  "Nizar",
  "Dolvan",
  "Kukarmunda",
  "Valod",
  "Vadodara",
  "Savli",
  "Karjan",
  "Dabhoi",
  "Padra",
  "Sinor",
  "Desar",
  "Valsad",
  "Pardi",
  "Umbergaon",
  "Kaprada",
  "Dharampur",
]

// Extract these from your data
const CITIES = [
  "Ahmedabad",
  "Amreli",
  "Anand",
  "Bharuch",
  "Bhavnagar",
  "Bhuj",
  "Gandhinagar",
  "Jamnagar",
  "Junagadh",
  "Mehsana",
  "Nadiad",
  "Navsari",
  "Rajkot",
  "Surat",
  // Add more cities as needed
]

const PINCODES = [
  "360001",
  "360002",
  "360003",
  "360004",
  "360005",
  "360006",
  "360007",
  "360020",
  "361001",
  "361002",
  "361003",
  "361004",
  "361005",
  "362001",
  "362002",
  "362011",
  // Add more pincodes as needed
]

interface UpdateDetailsFormProps {
  onCancel: () => void
  onUpdate: () => void
}

const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({ onCancel, onUpdate }) => {
  const student = useStudentStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [showCustomCity, setShowCustomCity] = useState(false)

  // Search filters for dropdowns
  const [districtFilter, setDistrictFilter] = useState("")
  const [talukaFilter, setTalukaFilter] = useState("")
  // const [cityFilter, setCityFilter] = useState("")
  const [pincodeFilter, setPincodeFilter] = useState("")

  // Default values from the store
  const defaultValues = {
    roll_no: student.roll_no || "",
    name: student.name || "",
    date_of_birth: student.date_of_birth ? student.date_of_birth.split("T")[0] : "",
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
  }

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateDetailsInput>({
    resolver: zodResolver(updateDetailsSchema),
    defaultValues,
  })

  // Watch form values for changes
  const formValues = watch()

  // Effect to check if city needs custom input
  useEffect(() => {
    if (defaultValues.city && !CITIES.includes(defaultValues.city)) {
      setShowCustomCity(true)
    }
  }, [defaultValues])

  // Check if there are any actual changes in the data
  useEffect(() => {
    // Filter out roll_no since it's read-only
    const { roll_no, ...currentValues } = formValues
    const { roll_no: origRoll, ...originalValues } = defaultValues

    setHasChanges(!isEqual(currentValues, originalValues))
  }, [formValues, defaultValues])

  // Filtered lists for dropdowns
  const filteredDistricts = DISTRICTS.filter((district) =>
    district.toLowerCase().includes(districtFilter.toLowerCase()),
  )

  const filteredTalukas = TALUKAS.filter((taluka) => taluka.toLowerCase().includes(talukaFilter.toLowerCase()))

  // const filteredCities = CITIES.filter((city) => city.toLowerCase().includes(cityFilter.toLowerCase()))

  const filteredPincodes = PINCODES.filter((pincode) => pincode.includes(pincodeFilter))

  const onSubmit = async (data: UpdateDetailsInput) => {
    // If no changes, show message and return
    if (!hasChanges) {
      setSuccess("No changes detected in your data.")
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const updatedData = await updateStudentData(student.roll_no, data)

      // Check if mobile number was changed
      const mobileChanged = data.mobile_number !== student.mobile_number

      student.setStudentData({
        ...updatedData,
        is_data_verified: false,
        is_mobile_verified: !mobileChanged && student.is_mobile_verified,
      })

      setSuccess("Your details have been saved successfully.")

      // Give user time to see success message before continuing
      setTimeout(() => {
        onUpdate()
      }, 1500)
    } catch (err: any) {
      console.error("Failed to update data:", err)
      setError(err.response?.data?.error || "Update failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Create a reusable dropdown component with search functionality
  // Create a reusable dropdown component with search functionality
  const SearchableDropdown = ({
    name,
    label,
    options,
    filter,
    setFilter,
    placeholder,
  }: {
    name: keyof UpdateDetailsInput
    label: string
    options: string[]
    filter: string
    setFilter: (value: string) => void
    placeholder: string
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [])

    return (
      <div className="space-y-2">
        <Label htmlFor={name.toString()} className="text-gray-700">
          {label}
        </Label>
        <div className="relative" ref={dropdownRef}>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <div>
                <div className="flex items-center relative">
                  <Input
                    placeholder={placeholder}
                    value={filter}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setFilter(newValue)
                      // Only update the form field if we're selecting from dropdown
                      if (!isOpen) setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="focus:border-blue-300 w-full pr-8"
                  />
                  <Search className="h-4 w-4 text-gray-500 absolute right-3" />
                </div>

                {isOpen && (
                  <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
                    {options.length > 0 ? (
                      options.map((option) => (
                        <div
                          key={option}
                          className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                            field.value === option ? "bg-blue-100" : ""
                          }`}
                          onClick={() => {
                            field.onChange(option)
                            setFilter(option)
                            setIsOpen(false)
                          }}
                        >
                          {option}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          />
        </div>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]?.message}</p>}
      </div>
    )
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const dropdowns = document.querySelectorAll(".absolute.z-10")

      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(target) && !dropdown.previousElementSibling?.contains(target)) {
          // Find and close the dropdown
          const dropdownState = Array.from(dropdown.classList).some(
            (cls) => cls.includes("block") && !cls.includes("hidden"),
          )

          if (dropdownState) {
            // This is a hack to force React to update the state
            document.body.click()
          }
        }
      })
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
                <h3 className="font-medium mb-2 text-gray-700">Input Guidelines:</h3>
                <ul className="text-sm space-y-2 text-gray-600">
                  {Object.entries(INPUT_GUIDELINES).map(([field, guideline]) => (
                    <li key={field} className="flex flex-col sm:flex-row sm:gap-2">
                      <span className="font-medium text-gray-700">
                        {field.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
                      </span>
                      <span>{guideline}</span>
                    </li>
                  ))}
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
                <Input id="roll_no" {...register("roll_no")} readOnly className="bg-gray-50 focus:border-blue-300" />
                {errors.roll_no && <p className="text-sm text-red-500 mt-1">{errors.roll_no.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Name
                </Label>
                <Input id="name" {...register("name")} className="focus:border-blue-300" />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input id="email" type="email" {...register("email")} className="focus:border-blue-300" />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_number" className="text-gray-700">
                  Mobile Number
                </Label>
                <Input id="mobile_number" type="tel" {...register("mobile_number")} className="focus:border-blue-300" />
                {errors.mobile_number && <p className="text-sm text-red-500 mt-1">{errors.mobile_number.message}</p>}
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
                {errors.date_of_birth && <p className="text-sm text-red-500 mt-1">{errors.date_of_birth.message}</p>}
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
                  <p className="text-sm text-red-500 mt-1">{errors.father_mobile_number.message}</p>
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
                {errors.field_of_study && <p className="text-sm text-red-500 mt-1">{errors.field_of_study.message}</p>}
              </div>

              {/* Searchable District Dropdown */}
              <SearchableDropdown
                name="district"
                label="District"
                options={filteredDistricts}
                filter={districtFilter}
                setFilter={setDistrictFilter}
                placeholder="Select district"
              />

              {/* Searchable Taluka Dropdown */}
              <SearchableDropdown
                name="taluka"
                label="Taluka"
                options={filteredTalukas}
                filter={talukaFilter}
                setFilter={setTalukaFilter}
                placeholder="Select taluka"
              />

              {/* City Field (Dropdown + Custom Input Option) */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700">
                  City
                </Label>
                {showCustomCity ? (
                  <div className="flex">
                    <Input id="city" {...register("city")} className="focus:border-blue-300 flex-grow" />
                    <button
                      type="button"
                      onClick={() => setShowCustomCity(false)}
                      className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Use List
                    </button>
                  </div>
                ) : (
                  <div className="flex">
                    <div className="flex-grow relative" ref={useRef<HTMLDivElement>(null)}>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => {
                          const [isDropdownOpen, setIsDropdownOpen] = useState(false)
                          const [searchTerm, setSearchTerm] = useState("")

                          const filteredCityOptions = CITIES.filter((city) =>
                            city.toLowerCase().includes(searchTerm.toLowerCase()),
                          )

                          return (
                            <div>
                              <div
                                className="flex items-center justify-between border rounded-md px-3 py-2 focus-within:border-blue-300 cursor-pointer"
                                onClick={() => setIsDropdownOpen(true)}
                              >
                                <span className={field.value ? "" : "text-gray-400"}>
                                  {field.value || "Select city"}
                                </span>
                                <Search className="h-4 w-4 text-gray-500" />
                              </div>

                              {isDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg">
                                  <div className="p-2 border-b">
                                    <Input
                                      placeholder="Search cities..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className="border focus-visible:ring-1 focus-visible:ring-blue-300"
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="max-h-60 overflow-y-auto">
                                    {filteredCityOptions.length > 0 ? (
                                      filteredCityOptions.map((city) => (
                                        <div
                                          key={city}
                                          className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                                            field.value === city ? "bg-blue-100" : ""
                                          }`}
                                          onClick={() => {
                                            field.onChange(city)
                                            setIsDropdownOpen(false)
                                          }}
                                        >
                                          {city}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="px-3 py-2 text-sm text-gray-500">No cities found</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomCity(true)}
                      className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Enter Custom
                    </button>
                  </div>
                )}
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
              </div>

              {/* Searchable Pincode Dropdown */}
              <SearchableDropdown
                name="pincode"
                label="Pincode"
                options={filteredPincodes}
                filter={pincodeFilter}
                setFilter={setPincodeFilter}
                placeholder="Select pincode"
              />

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-gray-700">
                  Address
                </Label>
                <Textarea id="address" {...register("address")} rows={3} className="focus:border-blue-300" />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
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
                {loading ? "Saving..." : !hasChanges ? "No Changes" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

export default UpdateDetailsForm


// import React, { useState, useEffect, useRef } from "react";
// import { useStudentStore } from "../store/studentStore";
// import { updateStudentData } from "../services/api";
// import { Card, CardContent } from "./ui/card";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import { Label } from "./ui/label";
// import { Textarea } from "./ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import { Alert, AlertDescription } from "./ui/alert";
// import { AlertCircle, CheckCircle2, Info, Search } from "lucide-react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { updateDetailsSchema, UpdateDetailsInput } from "../validation/schemas";
// import { isEqual } from "lodash";

// // Field of study options with BTech Computer merged
// const FIELD_OPTIONS = [
//   "BTech Computer", // Merged field
//   "Engineering",
//   "Medicine",
//   "Arts",
//   "Science",
//   "Commerce",
//   "Law",
// ];

// // Input format guidelines
// const INPUT_GUIDELINES = {
//   name: "Full name as per official records",
//   date_of_birth: "Format: YYYY-MM-DD",
//   mobile_number: "10-digit mobile number without country code",
//   email: "Valid email address (e.g., example@domain.com)",
//   father_mobile_number: "10-digit mobile number without country code",
//   address: "Complete address with city, state and PIN code",
//   taluka: "Taluka/Tehsil name",
//   city: "City name", // New city guideline
//   district: "District name",
//   pincode: "6-digit pincode",
// };

// // Define separate lists for districts and talukas
// const DISTRICTS = [
//   "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", 
//   "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhumi Dwarka", "Gandhinagar", 
//   "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda", "Mahesana", "Mahisagar", 
//   "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", 
//   "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
// ];

// const TALUKAS = [
//   "Ahmedabad City", "Daskroi", "Detroj-Rampura", "Dholka", "Dhandhuka", "Sanand", "Viramgam", "Bavla",
//   "Amreli", "Lathi", "Lilia", "Savarkundla", "Khambha", "Jafrabad", "Rajula", "Bagasara", "Dhari", "Kunkavav", "Vadia",
//   "Anand", "Petlad", "Sojitra", "Khambhat", "Borsad", "Anklav", "Tarapur", "Umreth",
//   "Modasa", "Dhansura", "Malpur", "Meghraj", "Bayad", "Bhiloda",
//   "Palanpur", "Vadgam", "Danta", "Amirgadh", "Dantiwada", "Deesa", "Dhanera", "Kankrej", "Tharad", "Vav",
//   "Bharuch", "Amod", "Jambusar", "Jhagadia", "Ankleshwar", "Hansot", "Valia",
//   "Bhavnagar", "Ghogha", "Sihor", "Palitana", "Umrala", "Gariadhar", "Mahuva", "Talaja",
//   "Botad", "Barwala", "Gadhada", "Ranpur",
//   "Chhota Udaipur", "Jetpur", "Pavi Bodeli", "Kavant", "Naswadi", "Sankheda",
//   "Dahod", "Limkheda", "Zalod", "Garbada", "Dhanpur", "Devgad Baria", "Fatepura",
//   "Ahwa", "Waghai", "Subir",
//   "Khambhalia", "Bhanvad", "Kalyanpur", "Dwarka",
//   "Gandhinagar", "Dehgam", "Mansa", "Kalol",
//   "Veraval", "Kodinar", "Una", "Talala", "Sutrapada", "Gir Gadhada",
//   "Jamnagar", "Kalavad", "Dhrol", "Jodiya", "Jamjodhpur", "Lalpur",
//   "Junagadh", "Mangrol", "Manavadar", "Malia", "Visavadar", "Bhesan", "Vanthali", "Keshod",
//   "Kheda", "Kapadvanj", "Mehmedabad", "Mahudha", "Matar", "Thasra", "Nadiad", "Vaso", "Galteshwar",
//   "Bhuj", "Anjar", "Gandhidham", "Mandvi", "Mundra", "Nakhatrana", "Abdasa", "Lakhpat", "Rapar",
//   "Lunawada", "Santrampur", "Kadana", "Khanpur", "Balasinor", "Virpur",
//   "Mehsana", "Kadi", "Vijapur", "Visnagar", "Becharaji", "Satlasana", "Kheralu", "Unjha",
//   "Morbi", "Tankara", "Wankaner", "Halvad", "Maliya",
//   "Rajpipla", "Garudeshwar", "Nandod", "Sagbara", "Tilakwada", "Dediapada",
//   "Navsari", "Jalalpore", "Gandevi", "Chikhli", "Khergam", "Vansda",
//   "Godhra", "Lunawada", "Morwa Hadaf", "Shehera", "Khanpur", "Santrampur", "Halol", "Kalol",
//   "Patan", "Siddhpur", "Chanasma", "Sami", "Harij", "Radhanpur", "Santalpur",
//   "Porbandar", "Ranavav", "Kutiyana",
//   "Rajkot", "Lodhika", "Jasdan", "Kotda Sangani", "Gondal", "Jetpur", "Dhoraji", "Paddhari",
//   "Himatnagar", "Idar", "Khedbrahma", "Poshina", "Vadali", "Talod", "Prantij", "Bayad",
//   "Surat City", "Choryasi", "Olpad", "Mandvi", "Mangrol", "Umarpada", "Bardoli", "Kamrej", "Mahuva",
//   "Surendranagar", "Wadhwan", "Limbdi", "Chotila", "Sayla", "Thangadh", "Lakhtar", "Dhrangadhra", "Halvad",
//   "Vyara", "Songadh", "Uchchhal", "Nizar", "Dolvan", "Kukarmunda", "Valod",
//   "Vadodara", "Savli", "Karjan", "Dabhoi", "Padra", "Sinor", "Desar",
//   "Valsad", "Pardi", "Umbergaon", "Kaprada", "Dharampur"
// ];

// // Extract these from your data
// const CITIES = [
//   "Ahmedabad", "Amreli", "Anand", "Bharuch", "Bhavnagar", "Bhuj", "Gandhinagar",
//   "Jamnagar", "Junagadh", "Mehsana", "Nadiad", "Navsari", "Rajkot", "Surat",
//   // Add more cities as needed
// ];

// const PINCODES = [
//   "360001", "360002", "360003", "360004", "360005", "360006", "360007", "360020",
//   "361001", "361002", "361003", "361004", "361005", "362001", "362002", "362011",
//   // Add more pincodes as needed
// ];

// interface UpdateDetailsFormProps {
//   onCancel: () => void;
//   onUpdate: () => void;
// }

// const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({
//   onCancel,
//   onUpdate,
// }) => {
//   const student = useStudentStore();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [hasChanges, setHasChanges] = useState(false);
//   const [showGuidelines, setShowGuidelines] = useState(false);
//   const [showCustomCity, setShowCustomCity] = useState(false);
  
//   // Search filters for dropdowns
//   const [districtFilter, setDistrictFilter] = useState("");
//   const [talukaFilter, setTalukaFilter] = useState("");
//   const [cityFilter, setCityFilter] = useState("");
//   const [pincodeFilter, setPincodeFilter] = useState("");

//   // Default values from the store
//   const defaultValues = {
//     roll_no: student.roll_no || "",
//     name: student.name || "",
//     date_of_birth: student.date_of_birth
//       ? student.date_of_birth.split("T")[0]
//       : "",
//     mobile_number: student.mobile_number || "",
//     email: student.email || "",
//     father_mobile_number: student.father_mobile_number || "",
//     field_of_study: student.field_of_study || "",
//     // branch is removed
//     address: student.address || "",
//     taluka: student.taluka || "",
//     city: student.city || "", // New city field
//     district: student.district || "",
//     pincode: student.pincode || "",
//   };

//   const {
//     control,
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isDirty },
//   } = useForm<UpdateDetailsInput>({
//     resolver: zodResolver(updateDetailsSchema),
//     defaultValues,
//   });

//   // Watch form values for changes
//   const formValues = watch();

//   // Effect to check if city needs custom input
//   useEffect(() => {
//     if (defaultValues.city && !CITIES.includes(defaultValues.city)) {
//       setShowCustomCity(true);
//     }
//   }, [defaultValues]);

//   // Check if there are any actual changes in the data
//   useEffect(() => {
//     // Filter out roll_no since it's read-only
//     const { roll_no, ...currentValues } = formValues;
//     const { roll_no: origRoll, ...originalValues } = defaultValues;

//     setHasChanges(!isEqual(currentValues, originalValues));
//   }, [formValues, defaultValues]);

//   // Filtered lists for dropdowns
//   const filteredDistricts = DISTRICTS.filter(district => 
//     district.toLowerCase().includes(districtFilter.toLowerCase())
//   );

//   const filteredTalukas = TALUKAS.filter(taluka => 
//     taluka.toLowerCase().includes(talukaFilter.toLowerCase())
//   );

//   const filteredCities = CITIES.filter(city => 
//     city.toLowerCase().includes(cityFilter.toLowerCase())
//   );

//   const filteredPincodes = PINCODES.filter(pincode => 
//     pincode.includes(pincodeFilter)
//   );

//   const onSubmit = async (data: UpdateDetailsInput) => {
//     // If no changes, show message and return
//     if (!hasChanges) {
//       setSuccess("No changes detected in your data.");
//       setTimeout(() => {
//         setSuccess(null);
//       }, 3000);
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const updatedData = await updateStudentData(student.roll_no, data);

//       // Check if mobile number was changed
//       const mobileChanged = data.mobile_number !== student.mobile_number;

//       student.setStudentData({
//         ...updatedData,
//         is_data_verified: false,
//         is_mobile_verified: !mobileChanged && student.is_mobile_verified,
//       });

//       setSuccess("Your details have been saved successfully.");

//       // Give user time to see success message before continuing
//       setTimeout(() => {
//         onUpdate();
//       }, 1500);
//     } catch (err: any) {
//       console.error("Failed to update data:", err);
//       setError(err.response?.data?.error || "Update failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create a reusable dropdown component with search functionality
//  // Create a reusable dropdown component with search functionality
// const SearchableDropdown = ({ 
//   name, 
//   label, 
//   options, 
//   filter, 
//   setFilter,
//   placeholder 
// }: { 
//   name: keyof UpdateDetailsInput, 
//   label: string, 
//   options: string[], 
//   filter: string, 
//   setFilter: (value: string) => void,
//   placeholder: string 
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);
//   return (
//     <div className="space-y-2">
//       <Label htmlFor={name.toString()} className="text-gray-700">
//         {label}
//       </Label>
//       <div className="relative" ref={dropdownRef}>
//         <Controller
//           name={name}
//           control={control}
//           render={({ field }) => {
//             // Initialize the filter with field value if not already set
//             useEffect(() => {
//               if (field.value && !filter) {
//                 // Ensure we're passing a string to setFilter
//                 setFilter(typeof field.value === 'string' ? field.value : String(field.value));
//               }
//             }, [field.value, filter]);
            
//             return (
//               <div>
//                 <div className="flex items-center relative">
//                   <Input
//                     placeholder={placeholder}
//                     value={filter}
//                     onChange={(e) => {
//                       const newValue = e.target.value;
//                       setFilter(newValue);
//                       // Update the form field value too
//                       field.onChange(newValue);
//                       if (!isOpen && newValue) setIsOpen(true);
//                     }}
//                     onFocus={() => setIsOpen(true)}
//                     className="focus:border-blue-300 w-full pr-8"
//                   />
//                   <Search className="h-4 w-4 text-gray-500 absolute right-3" />
//                 </div>
                
//                 {isOpen && (
//                   <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
//                     {options.length > 0 ? (
//                       options.map((option) => (
//                         <div
//                           key={option}
//                           className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
//                             field.value === option ? "bg-blue-100" : ""
//                           }`}
//                           onClick={() => {
//                             field.onChange(option);
//                             setFilter(option);
//                             setIsOpen(false);
//                           }}
//                         >
//                           {option}
//                         </div>
//                       ))
//                     ) : (
//                       <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           }}
//         />
//       </div>
//       {errors[name] && (
//         <p className="text-sm text-red-500 mt-1">
//           {errors[name]?.message}
//         </p>
//       )}
//     </div>
//   );
// };

//   return (
//     <Card className="shadow-md border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
//       <CardContent className="p-0">
//         <div className="p-4 md:p-6">
//           <div className="mb-6">
//             <Alert
//               variant="default"
//               className="bg-blue-50 border-blue-200 flex flex-col sm:flex-row sm:items-center gap-2"
//             >
//               <div className="flex items-center">
//                 <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mr-2" />
//                 <AlertDescription className="text-blue-700">
//                   Please enter information accurately as per official records.
//                 </AlertDescription>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setShowGuidelines(!showGuidelines)}
//                 className="text-blue-600 hover:text-blue-800 mt-2 sm:mt-0 sm:ml-auto px-3"
//               >
//                 {showGuidelines ? "Hide Guidelines" : "View Guidelines"}
//               </Button>
//             </Alert>

//             {showGuidelines && (
//               <div className="mt-4 p-4 bg-gray-50 rounded-md border animate-fadeIn">
//                 <h3 className="font-medium mb-2 text-gray-700">
//                   Input Guidelines:
//                 </h3>
//                 <ul className="text-sm space-y-2 text-gray-600">
//                   {Object.entries(INPUT_GUIDELINES).map(
//                     ([field, guideline]) => (
//                       <li
//                         key={field}
//                         className="flex flex-col sm:flex-row sm:gap-2"
//                       >
//                         <span className="font-medium text-gray-700">
//                           {field
//                             .replace("_", " ")
//                             .replace(/\b\w/g, (l) => l.toUpperCase())}
//                           :
//                         </span>
//                         <span>{guideline}</span>
//                       </li>
//                     )
//                   )}
//                 </ul>
//               </div>
//             )}
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="roll_no" className="text-gray-700">
//                   Roll No
//                 </Label>
//                 <Input
//                   id="roll_no"
//                   {...register("roll_no")}
//                   readOnly
//                   className="bg-gray-50 focus:border-blue-300"
//                 />
//                 {errors.roll_no && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.roll_no.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="name" className="text-gray-700">
//                   Name
//                 </Label>
//                 <Input
//                   id="name"
//                   {...register("name")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.name && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.name.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-gray-700">
//                   Email
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   {...register("email")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.email.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="mobile_number" className="text-gray-700">
//                   Mobile Number
//                 </Label>
//                 <Input
//                   id="mobile_number"
//                   type="tel"
//                   {...register("mobile_number")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.mobile_number && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.mobile_number.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="date_of_birth" className="text-gray-700">
//                   Date of Birth
//                 </Label>
//                 <Input
//                   id="date_of_birth"
//                   type="date"
//                   {...register("date_of_birth")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.date_of_birth && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.date_of_birth.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="father_mobile_number" className="text-gray-700">
//                   Father's Mobile Number
//                 </Label>
//                 <Input
//                   id="father_mobile_number"
//                   type="tel"
//                   {...register("father_mobile_number")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.father_mobile_number && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.father_mobile_number.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="field_of_study" className="text-gray-700">
//                   Field of Study
//                 </Label>
//                 <Controller
//                   name="field_of_study"
//                   control={control}
//                   render={({ field }) => (
//                     <Select value={field.value} onValueChange={field.onChange}>
//                       <SelectTrigger className="focus:border-blue-300">
//                         <SelectValue placeholder="Select field of study" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {FIELD_OPTIONS.map((fieldOption) => (
//                           <SelectItem key={fieldOption} value={fieldOption}>
//                             {fieldOption}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {errors.field_of_study && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.field_of_study.message}
//                   </p>
//                 )}
//               </div>

//               {/* Searchable District Dropdown */}
//               <SearchableDropdown
//                 name="district"
//                 label="District"
//                 options={filteredDistricts}
//                 filter={districtFilter}
//                 setFilter={setDistrictFilter}
//                 placeholder="Select district"
//               />

//               {/* Searchable Taluka Dropdown */}
//               <SearchableDropdown
//                 name="taluka"
//                 label="Taluka"
//                 options={filteredTalukas}
//                 filter={talukaFilter}
//                 setFilter={setTalukaFilter}
//                 placeholder="Select taluka"
//               />

//               {/* City Field (Dropdown + Custom Input Option) */}
//               <div className="space-y-2">
//                 <Label htmlFor="city" className="text-gray-700">
//                   City
//                 </Label>
//                 {showCustomCity ? (
//                   <div className="flex">
//                     <Input
//                       id="city"
//                       {...register("city")}
//                       className="focus:border-blue-300 flex-grow"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowCustomCity(false)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Use List
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex">
//                     <div className="flex-grow">
//                       <Controller
//                         name="city"
//                         control={control}
//                         render={({ field }) => (
//                           <Select 
//                             value={field.value} 
//                             onValueChange={field.onChange}
//                           >
//                             <SelectTrigger className="focus:border-blue-300 w-full">
//                               <SelectValue placeholder="Select city" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10 border-b">
//                                 <Search className="h-4 w-4 mr-2 text-gray-500" />
//                                 <Input
//                                   placeholder="Search..."
//                                   value={cityFilter}
//                                   onChange={(e) => setCityFilter(e.target.value)}
//                                   className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
//                                 />
//                               </div>
//                               <div className="max-h-60 overflow-y-auto">
//                                 {filteredCities.length > 0 ? (
//                                   filteredCities.map((city) => (
//                                     <SelectItem key={city} value={city}>
//                                       {city}
//                                     </SelectItem>
//                                   ))
//                                 ) : (
//                                   <div className="px-2 py-2 text-sm text-gray-500">No results found</div>
//                                 )}
//                               </div>
//                             </SelectContent>
//                           </Select>
//                         )}
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setShowCustomCity(true)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Enter Custom
//                     </button>
//                   </div>
//                 )}
//                 {errors.city && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.city.message}
//                   </p>
//                 )}
//               </div>

//               {/* Searchable Pincode Dropdown */}
//               <SearchableDropdown
//                 name="pincode"
//                 label="Pincode"
//                 options={filteredPincodes}
//                 filter={pincodeFilter}
//                 setFilter={setPincodeFilter}
//                 placeholder="Select pincode"
//               />

//               <div className="space-y-2 md:col-span-2">
//                 <Label htmlFor="address" className="text-gray-700">
//                   Address
//                 </Label>
//                 <Textarea
//                   id="address"
//                   {...register("address")}
//                   rows={3}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.address && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.address.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {error && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             {success && (
//               <Alert
//                 variant="default"
//                 className="bg-green-50 text-green-800 border-green-200"
//               >
//                 <CheckCircle2 className="h-4 w-4 text-green-600" />
//                 <AlertDescription>{success}</AlertDescription>
//               </Alert>
//             )}

//             <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={onCancel}
//                 disabled={loading}
//                 className="order-2 sm:order-1"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 disabled={loading || (!hasChanges && isDirty)}
//                 className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
//               >
//                 {loading
//                   ? "Saving..."
//                   : !hasChanges
//                   ? "No Changes"
//                   : "Save Changes"}
//               </Button>
//             </div>
//           </form>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default UpdateDetailsForm;

// import React, { useState, useEffect } from "react";
// import { useStudentStore } from "../store/studentStore";
// import { updateStudentData } from "../services/api";
// import { Card, CardContent } from "./ui/card";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import { Label } from "./ui/label";
// import { Textarea } from "./ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import { Alert, AlertDescription } from "./ui/alert";
// import { AlertCircle, CheckCircle2, Info } from "lucide-react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { updateDetailsSchema, UpdateDetailsInput } from "../validation/schemas";
// import { isEqual } from "lodash";

// // Field of study options with BTech Computer merged
// const FIELD_OPTIONS = [
//   "BTech Computer", // Merged field
//   "Engineering",
//   "Medicine",
//   "Arts",
//   "Science",
//   "Commerce",
//   "Law",
// ];

// // Input format guidelines
// const INPUT_GUIDELINES = {
//   name: "Full name as per official records",
//   date_of_birth: "Format: YYYY-MM-DD",
//   mobile_number: "10-digit mobile number without country code",
//   email: "Valid email address (e.g., example@domain.com)",
//   father_mobile_number: "10-digit mobile number without country code",
//   address: "Complete address with city, state and PIN code",
//   taluka: "Taluka/Tehsil name",
//   city: "City name", // New city guideline
//   district: "District name",
//   pincode: "6-digit pincode",
// };

// // Define separate lists for districts and talukas
// const DISTRICTS = [
//   "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", 
//   "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhumi Dwarka", "Gandhinagar", 
//   "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda", "Mahesana", "Mahisagar", 
//   "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", 
//   "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
// ];

// const TALUKAS = [
//   "Ahmedabad City", "Daskroi", "Detroj-Rampura", "Dholka", "Dhandhuka", "Sanand", "Viramgam", "Bavla",
//   "Amreli", "Lathi", "Lilia", "Savarkundla", "Khambha", "Jafrabad", "Rajula", "Bagasara", "Dhari", "Kunkavav", "Vadia",
//   "Anand", "Petlad", "Sojitra", "Khambhat", "Borsad", "Anklav", "Tarapur", "Umreth",
//   "Modasa", "Dhansura", "Malpur", "Meghraj", "Bayad", "Bhiloda",
//   "Palanpur", "Vadgam", "Danta", "Amirgadh", "Dantiwada", "Deesa", "Dhanera", "Kankrej", "Tharad", "Vav",
//   "Bharuch", "Amod", "Jambusar", "Jhagadia", "Ankleshwar", "Hansot", "Valia",
//   "Bhavnagar", "Ghogha", "Sihor", "Palitana", "Umrala", "Gariadhar", "Mahuva", "Talaja",
//   "Botad", "Barwala", "Gadhada", "Ranpur",
//   "Chhota Udaipur", "Jetpur", "Pavi Bodeli", "Kavant", "Naswadi", "Sankheda",
//   "Dahod", "Limkheda", "Zalod", "Garbada", "Dhanpur", "Devgad Baria", "Fatepura",
//   "Ahwa", "Waghai", "Subir",
//   "Khambhalia", "Bhanvad", "Kalyanpur", "Dwarka",
//   "Gandhinagar", "Dehgam", "Mansa", "Kalol",
//   "Veraval", "Kodinar", "Una", "Talala", "Sutrapada", "Gir Gadhada",
//   "Jamnagar", "Kalavad", "Dhrol", "Jodiya", "Jamjodhpur", "Lalpur",
//   "Junagadh", "Mangrol", "Manavadar", "Malia", "Visavadar", "Bhesan", "Vanthali", "Keshod",
//   "Kheda", "Kapadvanj", "Mehmedabad", "Mahudha", "Matar", "Thasra", "Nadiad", "Vaso", "Galteshwar",
//   "Bhuj", "Anjar", "Gandhidham", "Mandvi", "Mundra", "Nakhatrana", "Abdasa", "Lakhpat", "Rapar",
//   "Lunawada", "Santrampur", "Kadana", "Khanpur", "Balasinor", "Virpur",
//   "Mehsana", "Kadi", "Vijapur", "Visnagar", "Becharaji", "Satlasana", "Kheralu", "Unjha",
//   "Morbi", "Tankara", "Wankaner", "Halvad", "Maliya",
//   "Rajpipla", "Garudeshwar", "Nandod", "Sagbara", "Tilakwada", "Dediapada",
//   "Navsari", "Jalalpore", "Gandevi", "Chikhli", "Khergam", "Vansda",
//   "Godhra", "Lunawada", "Morwa Hadaf", "Shehera", "Khanpur", "Santrampur", "Halol", "Kalol",
//   "Patan", "Siddhpur", "Chanasma", "Sami", "Harij", "Radhanpur", "Santalpur",
//   "Porbandar", "Ranavav", "Kutiyana",
//   "Rajkot", "Lodhika", "Jasdan", "Kotda Sangani", "Gondal", "Jetpur", "Dhoraji", "Paddhari",
//   "Himatnagar", "Idar", "Khedbrahma", "Poshina", "Vadali", "Talod", "Prantij", "Bayad",
//   "Surat City", "Choryasi", "Olpad", "Mandvi", "Mangrol", "Umarpada", "Bardoli", "Kamrej", "Mahuva",
//   "Surendranagar", "Wadhwan", "Limbdi", "Chotila", "Sayla", "Thangadh", "Lakhtar", "Dhrangadhra", "Halvad",
//   "Vyara", "Songadh", "Uchchhal", "Nizar", "Dolvan", "Kukarmunda", "Valod",
//   "Vadodara", "Savli", "Karjan", "Dabhoi", "Padra", "Sinor", "Desar",
//   "Valsad", "Pardi", "Umbergaon", "Kaprada", "Dharampur"
// ];

// // Extract these from your data
// const CITIES = [
//   "Ahmedabad", "Amreli", "Anand", "Bharuch", "Bhavnagar", "Bhuj", "Gandhinagar",
//   "Jamnagar", "Junagadh", "Mehsana", "Nadiad", "Navsari", "Rajkot", "Surat",
//   // Add more cities as needed
// ];

// const PINCODES = [
//   "360001", "360002", "360003", "360004", "360005", "360006", "360007", "360020",
//   "361001", "361002", "361003", "361004", "361005", "362001", "362002", "362011",
//   // Add more pincodes as needed
// ];

// interface UpdateDetailsFormProps {
//   onCancel: () => void;
//   onUpdate: () => void;
// }

// const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({
//   onCancel,
//   onUpdate,
// }) => {
//   const student = useStudentStore();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [hasChanges, setHasChanges] = useState(false);
//   const [showGuidelines, setShowGuidelines] = useState(false);
//   const [showCustomPincode, setShowCustomPincode] = useState(false);
//   const [showCustomCity, setShowCustomCity] = useState(false);
//   const [showCustomDistrict, setShowCustomDistrict] = useState(false);
//   const [showCustomTaluka, setShowCustomTaluka] = useState(false);

//   // Default values from the store
//   const defaultValues = {
//     roll_no: student.roll_no || "",
//     name: student.name || "",
//     date_of_birth: student.date_of_birth
//       ? student.date_of_birth.split("T")[0]
//       : "",
//     mobile_number: student.mobile_number || "",
//     email: student.email || "",
//     father_mobile_number: student.father_mobile_number || "",
//     field_of_study: student.field_of_study || "",
//     // branch is removed
//     address: student.address || "",
//     taluka: student.taluka || "",
//     city: student.city || "", // New city field
//     district: student.district || "",
//     pincode: student.pincode || "",
//   };

//   const {
//     control,
//     register,
//     handleSubmit,
//     watch,
//     setValue,  // <-- Extract setValue from useForm
//     formState: { errors, isDirty },
//   } = useForm<UpdateDetailsInput>({
//     resolver: zodResolver(updateDetailsSchema),
//     defaultValues,
//   });

//   // Watch form values for changes
//   const formValues = watch();

//   // Effect to check if values exist in our lists, if not use custom input
//   useEffect(() => {
//     // Check if district needs custom input
//     if (defaultValues.district && !DISTRICTS.includes(defaultValues.district)) {
//       setShowCustomDistrict(true);
//     }
    
//     // Check if taluka needs custom input
//     if (defaultValues.taluka && !TALUKAS.includes(defaultValues.taluka)) {
//       setShowCustomTaluka(true);
//     }
    
//     // Check if city needs custom input
//     if (defaultValues.city && !CITIES.includes(defaultValues.city)) {
//       setShowCustomCity(true);
//     }
    
//     // Check if pincode needs custom input
//     if (defaultValues.pincode && !PINCODES.includes(defaultValues.pincode)) {
//       setShowCustomPincode(true);
//     }
//   }, [defaultValues]);

//   // Check if there are any actual changes in the data
//   useEffect(() => {
//     // Filter out roll_no since it's read-only
//     const { roll_no, ...currentValues } = formValues;
//     const { roll_no: origRoll, ...originalValues } = defaultValues;

//     setHasChanges(!isEqual(currentValues, originalValues));
//   }, [formValues, defaultValues]);

//   // Helper function to check if a value exists in a list
//   const valueExistsInList = (value: string, list: string[]) => {
//     return list.includes(value);
//   };

//   // Handle switching from custom input to dropdown list
//   const handleSwitchToList = (field: string, list: string[]) => {
//     const currentValue = formValues[field as keyof UpdateDetailsInput];
    
//     // If current value doesn't exist in the list, reset it
//     if (currentValue && !valueExistsInList(currentValue as string, list)) {
//       setValue(field as any, "");
//     }
    
//     // Switch to dropdown view
//     switch(field) {
//       case "district":
//         setShowCustomDistrict(false);
//         break;
//       case "taluka":
//         setShowCustomTaluka(false);
//         break;
//       case "city":
//         setShowCustomCity(false);
//         break;
//       case "pincode":
//         setShowCustomPincode(false);
//         break;
//     }
//   };

//   const onSubmit = async (data: UpdateDetailsInput) => {
//     // If no changes, show message and return
//     if (!hasChanges) {
//       setSuccess("No changes detected in your data.");
//       setTimeout(() => {
//         setSuccess(null);
//       }, 3000);
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const updatedData = await updateStudentData(student.roll_no, data);

//       // Check if mobile number was changed
//       const mobileChanged = data.mobile_number !== student.mobile_number;

//       student.setStudentData({
//         ...updatedData,
//         is_data_verified: false,
//         is_mobile_verified: !mobileChanged && student.is_mobile_verified,
//       });

//       setSuccess("Your details have been saved successfully.");

//       // Give user time to see success message before continuing
//       setTimeout(() => {
//         onUpdate();
//       }, 1500);
//     } catch (err: any) {
//       console.error("Failed to update data:", err);
//       setError(err.response?.data?.error || "Update failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="shadow-md border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
//       <CardContent className="p-0">
//         <div className="p-4 md:p-6">
//           <div className="mb-6">
//             <Alert
//               variant="default"
//               className="bg-blue-50 border-blue-200 flex flex-col sm:flex-row sm:items-center gap-2"
//             >
//               <div className="flex items-center">
//                 <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mr-2" />
//                 <AlertDescription className="text-blue-700">
//                   Please enter information accurately as per official records.
//                 </AlertDescription>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setShowGuidelines(!showGuidelines)}
//                 className="text-blue-600 hover:text-blue-800 mt-2 sm:mt-0 sm:ml-auto px-3"
//               >
//                 {showGuidelines ? "Hide Guidelines" : "View Guidelines"}
//               </Button>
//             </Alert>

//             {showGuidelines && (
//               <div className="mt-4 p-4 bg-gray-50 rounded-md border animate-fadeIn">
//                 <h3 className="font-medium mb-2 text-gray-700">
//                   Input Guidelines:
//                 </h3>
//                 <ul className="text-sm space-y-2 text-gray-600">
//                   {Object.entries(INPUT_GUIDELINES).map(
//                     ([field, guideline]) => (
//                       <li
//                         key={field}
//                         className="flex flex-col sm:flex-row sm:gap-2"
//                       >
//                         <span className="font-medium text-gray-700">
//                           {field
//                             .replace("_", " ")
//                             .replace(/\b\w/g, (l) => l.toUpperCase())}
//                           :
//                         </span>
//                         <span>{guideline}</span>
//                       </li>
//                     )
//                   )}
//                 </ul>
//               </div>
//             )}
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="roll_no" className="text-gray-700">
//                   Roll No
//                 </Label>
//                 <Input
//                   id="roll_no"
//                   {...register("roll_no")}
//                   readOnly
//                   className="bg-gray-50 focus:border-blue-300"
//                 />
//                 {errors.roll_no && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.roll_no.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="name" className="text-gray-700">
//                   Name
//                 </Label>
//                 <Input
//                   id="name"
//                   {...register("name")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.name && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.name.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-gray-700">
//                   Email
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   {...register("email")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.email.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="mobile_number" className="text-gray-700">
//                   Mobile Number
//                 </Label>
//                 <Input
//                   id="mobile_number"
//                   type="tel"
//                   {...register("mobile_number")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.mobile_number && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.mobile_number.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="date_of_birth" className="text-gray-700">
//                   Date of Birth
//                 </Label>
//                 <Input
//                   id="date_of_birth"
//                   type="date"
//                   {...register("date_of_birth")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.date_of_birth && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.date_of_birth.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="father_mobile_number" className="text-gray-700">
//                   Father's Mobile Number
//                 </Label>
//                 <Input
//                   id="father_mobile_number"
//                   type="tel"
//                   {...register("father_mobile_number")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.father_mobile_number && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.father_mobile_number.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="field_of_study" className="text-gray-700">
//                   Field of Study
//                 </Label>
//                 <Controller
//                   name="field_of_study"
//                   control={control}
//                   render={({ field }) => (
//                     <Select value={field.value} onValueChange={field.onChange}>
//                       <SelectTrigger className="focus:border-blue-300">
//                         <SelectValue placeholder="Select field of study" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {FIELD_OPTIONS.map((fieldOption) => (
//                           <SelectItem key={fieldOption} value={fieldOption}>
//                             {fieldOption}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {errors.field_of_study && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.field_of_study.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="district" className="text-gray-700">
//                   District
//                 </Label>
//                 {showCustomDistrict ? (
//                   <div className="flex">
//                     <Input
//                       id="district"
//                       {...register("district")}
//                       className="focus:border-blue-300 flex-grow"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => handleSwitchToList("district", DISTRICTS)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Use List
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex">
//                     <div className="flex-grow">
//                       <Controller
//                         name="district"
//                         control={control}
//                         render={({ field }) => (
//                           <Select 
//                             value={field.value} 
//                             onValueChange={(value) => {
//                               field.onChange(value);
//                             }}
//                           >
//                             <SelectTrigger className="focus:border-blue-300 w-full">
//                               <SelectValue placeholder="Select district" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {DISTRICTS.map((district) => (
//                                 <SelectItem key={district} value={district}>
//                                   {district}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         )}
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowCustomDistrict(true);
//                       }}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Enter Custom
//                     </button>
//                   </div>
//                 )}
//                 {errors.district && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.district.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="taluka" className="text-gray-700">
//                   Taluka
//                 </Label>
//                 {showCustomTaluka ? (
//                   <div className="flex">
//                     <Input
//                       id="taluka"
//                       {...register("taluka")}
//                       className="focus:border-blue-300 flex-grow"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => handleSwitchToList("taluka", TALUKAS)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Use List
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex">
//                     <div className="flex-grow">
//                       <Controller
//                         name="taluka"
//                         control={control}
//                         render={({ field }) => (
//                           <Select 
//                             value={field.value} 
//                             onValueChange={field.onChange}
//                           >
//                             <SelectTrigger className="focus:border-blue-300 w-full">
//                               <SelectValue placeholder="Select taluka" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {TALUKAS.map((taluka) => (
//                                 <SelectItem key={taluka} value={taluka}>
//                                   {taluka}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         )}
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setShowCustomTaluka(true)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Enter Custom
//                     </button>
//                   </div>
//                 )}
//                 {errors.taluka && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.taluka.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="city" className="text-gray-700">
//                   City
//                 </Label>
//                 {showCustomCity ? (
//                   <div className="flex">
//                     <Input
//                       id="city"
//                       {...register("city")}
//                       className="focus:border-blue-300 flex-grow"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => handleSwitchToList("city", CITIES)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Use List
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex">
//                     <div className="flex-grow">
//                       <Controller
//                         name="city"
//                         control={control}
//                         render={({ field }) => (
//                           <Select 
//                             value={field.value} 
//                             onValueChange={field.onChange}
//                           >
//                             <SelectTrigger className="focus:border-blue-300 w-full">
//                               <SelectValue placeholder="Select city" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {CITIES.map((city) => (
//                                 <SelectItem key={city} value={city}>
//                                   {city}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         )}
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setShowCustomCity(true)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Enter Custom
//                     </button>
//                   </div>
//                 )}
//                 {errors.city && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.city.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="pincode" className="text-gray-700">
//                   Pincode
//                 </Label>
//                 {showCustomPincode ? (
//                   <div className="flex">
//                     <Input
//                       id="pincode"
//                       {...register("pincode")}
//                       className="focus:border-blue-300 flex-grow"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => handleSwitchToList("pincode", PINCODES)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Use List
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex">
//                     <div className="flex-grow">
//                       <Controller
//                         name="pincode"
//                         control={control}
//                         render={({ field }) => (
//                           <Select 
//                             value={field.value} 
//                             onValueChange={field.onChange}
//                           >
//                             <SelectTrigger className="focus:border-blue-300 w-full">
//                               <SelectValue placeholder="Select pincode" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {PINCODES.map((pincode) => (
//                                 <SelectItem key={pincode} value={pincode}>
//                                   {pincode}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         )}
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setShowCustomPincode(true)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Enter Custom
//                     </button>
//                   </div>
//                 )}
//                 {errors.pincode && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.pincode.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2 md:col-span-2">
//                 <Label htmlFor="address" className="text-gray-700">
//                   Address
//                 </Label>
//                 <Textarea
//                   id="address"
//                   {...register("address")}
//                   rows={3}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.address && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.address.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {error && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             {success && (
//               <Alert
//                 variant="default"
//                 className="bg-green-50 text-green-800 border-green-200"
//               >
//                 <CheckCircle2 className="h-4 w-4 text-green-600" />
//                 <AlertDescription>{success}</AlertDescription>
//               </Alert>
//             )}

//             <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={onCancel}
//                 disabled={loading}
//                 className="order-2 sm:order-1"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 disabled={loading || (!hasChanges && isDirty)}
//                 className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
//               >
//                 {loading
//                   ? "Saving..."
//                   : !hasChanges
//                   ? "No Changes"
//                   : "Save Changes"}
//               </Button>
//             </div>
//           </form>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default UpdateDetailsForm;

// // src/components/UpdateDetailsForm.tsx
// import React, { useState, useEffect } from "react";
// import { useStudentStore } from "../store/studentStore";
// import { updateStudentData } from "../services/api";
// import { Card, CardContent } from "./ui/card";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import { Label } from "./ui/label";
// import { Textarea } from "./ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import { Alert, AlertDescription } from "./ui/alert";
// import { AlertCircle, CheckCircle2, Info } from "lucide-react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { updateDetailsSchema, UpdateDetailsInput } from "../validation/schemas";
// import { isEqual } from "lodash";

// // Field of study options with BTech Computer merged
// const FIELD_OPTIONS = [
//   "BTech Computer", // Merged field
//   "Engineering",
//   "Medicine",
//   "Arts",
//   "Science",
//   "Commerce",
//   "Law",
// ];

// // Input format guidelines
// const INPUT_GUIDELINES = {
//   name: "Full name as per official records",
//   date_of_birth: "Format: YYYY-MM-DD",
//   mobile_number: "10-digit mobile number without country code",
//   email: "Valid email address (e.g., example@domain.com)",
//   father_mobile_number: "10-digit mobile number without country code",
//   address: "Complete address with city, state and PIN code",
//   taluka: "Taluka/Tehsil name",
//   city: "City name", // New city guideline
//   district: "District name",
//   pincode: "6-digit pincode",
// };

// // Add these constants at the top of your component or in a separate file
// const DISTRICT_TALUKA_MAP: Record<string, string[]> = {
//   "Ahmedabad": ["Ahmedabad City", "Daskroi", "Detroj-Rampura", "Dholka", "Dhandhuka", "Sanand", "Viramgam", "Bavla"],
//   "Amreli": ["Amreli", "Lathi", "Lilia", "Savarkundla", "Khambha", "Jafrabad", "Rajula", "Bagasara", "Dhari", "Kunkavav", "Vadia"],
//   // Add all the district-taluka mappings here
//   // ...
// };

// // Extract these from your data
// const CITIES = [
//   "Ahmedabad", "Amreli", "Anand", "Bharuch", "Bhavnagar", "Bhuj", "Gandhinagar",
//   "Jamnagar", "Junagadh", "Mehsana", "Nadiad", "Navsari", "Rajkot", "Surat",
//   // Add more cities as needed
// ];

// const PINCODES = [
//   "360001", "360002", "360003", "360004", "360005", "360006", "360007", "360020",
//   "361001", "361002", "361003", "361004", "361005", "362001", "362002", "362011",
//   // Add more pincodes as needed
// ];

// interface UpdateDetailsFormProps {
//   onCancel: () => void;
//   onUpdate: () => void;
// }

// const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({
//   onCancel,
//   onUpdate,
// }) => {
//   const student = useStudentStore();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [hasChanges, setHasChanges] = useState(false);
//   const [showGuidelines, setShowGuidelines] = useState(false);
//   const [selectedDistrict, setSelectedDistrict] = useState("");
//   const [talukaOptions, setTalukaOptions] = useState<string[]>([]);
//   const [showCustomPincode, setShowCustomPincode] = useState(false);
//   const [showCustomCity, setShowCustomCity] = useState(false);

//   // Add this effect to update taluka options when district changes
//   useEffect(() => {
//     if (selectedDistrict && selectedDistrict in DISTRICT_TALUKA_MAP) {
//       setTalukaOptions(DISTRICT_TALUKA_MAP[selectedDistrict] || []);
//     } else {
//       setTalukaOptions([]);
//     }
//   }, [selectedDistrict]);

//   // Default values from the store
//   const defaultValues = {
//     roll_no: student.roll_no || "",
//     name: student.name || "",
//     date_of_birth: student.date_of_birth
//       ? student.date_of_birth.split("T")[0]
//       : "",
//     mobile_number: student.mobile_number || "",
//     email: student.email || "",
//     father_mobile_number: student.father_mobile_number || "",
//     field_of_study: student.field_of_study || "",
//     // branch is removed
//     address: student.address || "",
//     taluka: student.taluka || "",
//     city: student.city || "", // New city field
//     district: student.district || "",
//     pincode: student.pincode || "",
//   };

//   const {
//     control,
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isDirty },
//   } = useForm<UpdateDetailsInput>({
//     resolver: zodResolver(updateDetailsSchema),
//     defaultValues,
//   });

//   // Watch form values for changes
//   const formValues = watch();

//   // Check if there are any actual changes in the data
//   useEffect(() => {
//     // Filter out roll_no since it's read-only
//     const { roll_no, ...currentValues } = formValues;
//     const { roll_no: origRoll, ...originalValues } = defaultValues;

//     setHasChanges(!isEqual(currentValues, originalValues));
//   }, [formValues, defaultValues]);

//   const onSubmit = async (data: UpdateDetailsInput) => {
//     // If no changes, show message and return
//     if (!hasChanges) {
//       setSuccess("No changes detected in your data.");
//       setTimeout(() => {
//         setSuccess(null);
//       }, 3000);
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const updatedData = await updateStudentData(student.roll_no, data);

//       // Check if mobile number was changed
//       const mobileChanged = data.mobile_number !== student.mobile_number;

//       student.setStudentData({
//         ...updatedData,
//         is_data_verified: false,
//         is_mobile_verified: !mobileChanged && student.is_mobile_verified,
//       });

//       setSuccess("Your details have been saved successfully.");

//       // Give user time to see success message before continuing
//       setTimeout(() => {
//         onUpdate();
//       }, 1500);
//     } catch (err: any) {
//       console.error("Failed to update data:", err);
//       setError(err.response?.data?.error || "Update failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="shadow-md border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
//       <CardContent className="p-0">
//         <div className="p-4 md:p-6">
//           <div className="mb-6">
//             <Alert
//               variant="default"
//               className="bg-blue-50 border-blue-200 flex flex-col sm:flex-row sm:items-center gap-2"
//             >
//               <div className="flex items-center">
//                 <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mr-2" />
//                 <AlertDescription className="text-blue-700">
//                   Please enter information accurately as per official records.
//                 </AlertDescription>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setShowGuidelines(!showGuidelines)}
//                 className="text-blue-600 hover:text-blue-800 mt-2 sm:mt-0 sm:ml-auto px-3"
//               >
//                 {showGuidelines ? "Hide Guidelines" : "View Guidelines"}
//               </Button>
//             </Alert>

//             {showGuidelines && (
//               <div className="mt-4 p-4 bg-gray-50 rounded-md border animate-fadeIn">
//                 <h3 className="font-medium mb-2 text-gray-700">
//                   Input Guidelines:
//                 </h3>
//                 <ul className="text-sm space-y-2 text-gray-600">
//                   {Object.entries(INPUT_GUIDELINES).map(
//                     ([field, guideline]) => (
//                       <li
//                         key={field}
//                         className="flex flex-col sm:flex-row sm:gap-2"
//                       >
//                         <span className="font-medium text-gray-700">
//                           {field
//                             .replace("_", " ")
//                             .replace(/\b\w/g, (l) => l.toUpperCase())}
//                           :
//                         </span>
//                         <span>{guideline}</span>
//                       </li>
//                     )
//                   )}
//                 </ul>
//               </div>
//             )}
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="roll_no" className="text-gray-700">
//                   Roll No
//                 </Label>
//                 <Input
//                   id="roll_no"
//                   {...register("roll_no")}
//                   readOnly
//                   className="bg-gray-50 focus:border-blue-300"
//                 />
//                 {errors.roll_no && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.roll_no.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="name" className="text-gray-700">
//                   Name
//                 </Label>
//                 <Input
//                   id="name"
//                   {...register("name")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.name && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.name.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-gray-700">
//                   Email
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   {...register("email")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.email.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="mobile_number" className="text-gray-700">
//                   Mobile Number
//                 </Label>
//                 <Input
//                   id="mobile_number"
//                   type="tel"
//                   {...register("mobile_number")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.mobile_number && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.mobile_number.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="date_of_birth" className="text-gray-700">
//                   Date of Birth
//                 </Label>
//                 <Input
//                   id="date_of_birth"
//                   type="date"
//                   {...register("date_of_birth")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.date_of_birth && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.date_of_birth.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="father_mobile_number" className="text-gray-700">
//                   Father's Mobile Number
//                 </Label>
//                 <Input
//                   id="father_mobile_number"
//                   type="tel"
//                   {...register("father_mobile_number")}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.father_mobile_number && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.father_mobile_number.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="field_of_study" className="text-gray-700">
//                   Field of Study
//                 </Label>
//                 <Controller
//                   name="field_of_study"
//                   control={control}
//                   render={({ field }) => (
//                     <Select value={field.value} onValueChange={field.onChange}>
//                       <SelectTrigger className="focus:border-blue-300">
//                         <SelectValue placeholder="Select field of study" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {FIELD_OPTIONS.map((fieldOption) => (
//                           <SelectItem key={fieldOption} value={fieldOption}>
//                             {fieldOption}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {errors.field_of_study && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.field_of_study.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="district" className="text-gray-700">
//                   District
//                 </Label>
//                 <Controller
//                   name="district"
//                   control={control}
//                   render={({ field }) => (
//                     <Select 
//                       value={field.value} 
//                       onValueChange={(value) => {
//                         field.onChange(value);
//                         setSelectedDistrict(value);
//                       }}
//                     >
//                       <SelectTrigger className="focus:border-blue-300">
//                         <SelectValue placeholder="Select district" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {Object.keys(DISTRICT_TALUKA_MAP).map((district) => (
//                           <SelectItem key={district} value={district}>
//                             {district}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {errors.district && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.district.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="taluka" className="text-gray-700">
//                   Taluka
//                 </Label>
//                 <Controller
//                   name="taluka"
//                   control={control}
//                   render={({ field }) => (
//                     <Select 
//                       value={field.value} 
//                       onValueChange={field.onChange}
//                       disabled={!selectedDistrict}
//                     >
//                       <SelectTrigger className="focus:border-blue-300">
//                         <SelectValue placeholder="Select taluka" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {talukaOptions.map((taluka) => (
//                           <SelectItem key={taluka} value={taluka}>
//                             {taluka}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {errors.taluka && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.taluka.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="city" className="text-gray-700">
//                   City
//                 </Label>
//                 {showCustomCity ? (
//                   <div className="flex">
//                     <Input
//                       id="city"
//                       {...register("city")}
//                       className="focus:border-blue-300 flex-grow"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowCustomCity(false)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Use List
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex">
//                     <div className="flex-grow">
//                       <Controller
//                         name="city"
//                         control={control}
//                         render={({ field }) => (
//                           <Select 
//                             value={field.value} 
//                             onValueChange={field.onChange}
//                           >
//                             <SelectTrigger className="focus:border-blue-300 w-full">
//                               <SelectValue placeholder="Select city" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {CITIES.map((city) => (
//                                 <SelectItem key={city} value={city}>
//                                   {city}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         )}
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setShowCustomCity(true)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Enter Custom
//                     </button>
//                   </div>
//                 )}
//                 {errors.city && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.city.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="pincode" className="text-gray-700">
//                   Pincode
//                 </Label>
//                 {showCustomPincode ? (
//                   <div className="flex">
//                     <Input
//                       id="pincode"
//                       {...register("pincode")}
//                       className="focus:border-blue-300 flex-grow"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowCustomPincode(false)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Use List
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex">
//                     <div className="flex-grow">
//                       <Controller
//                         name="pincode"
//                         control={control}
//                         render={({ field }) => (
//                           <Select 
//                             value={field.value} 
//                             onValueChange={field.onChange}
//                           >
//                             <SelectTrigger className="focus:border-blue-300 w-full">
//                               <SelectValue placeholder="Select pincode" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {PINCODES.map((pincode) => (
//                                 <SelectItem key={pincode} value={pincode}>
//                                   {pincode}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         )}
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setShowCustomPincode(true)}
//                       className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                     >
//                       Enter Custom
//                     </button>
//                   </div>
//                 )}
//                 {errors.pincode && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.pincode.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2 md:col-span-2">
//                 <Label htmlFor="address" className="text-gray-700">
//                   Address
//                 </Label>
//                 <Textarea
//                   id="address"
//                   {...register("address")}
//                   rows={3}
//                   className="focus:border-blue-300"
//                 />
//                 {errors.address && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.address.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {error && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             {success && (
//               <Alert
//                 variant="default"
//                 className="bg-green-50 text-green-800 border-green-200"
//               >
//                 <CheckCircle2 className="h-4 w-4 text-green-600" />
//                 <AlertDescription>{success}</AlertDescription>
//               </Alert>
//             )}

//             <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={onCancel}
//                 disabled={loading}
//                 className="order-2 sm:order-1"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 disabled={loading || (!hasChanges && isDirty)}
//                 className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
//               >
//                 {loading
//                   ? "Saving..."
//                   : !hasChanges
//                   ? "No Changes"
//                   : "Save Changes"}
//               </Button>
//             </div>
//           </form>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default UpdateDetailsForm;