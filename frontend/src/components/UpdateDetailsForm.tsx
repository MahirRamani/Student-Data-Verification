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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateDetailsSchema, type UpdateDetailsInput } from "../validation/schemas"
import { isEqual } from "lodash"
import { Control, Controller, FieldErrors } from "react-hook-form"

// Field of study options with BTech Computer merged
const FIELD_OPTIONS = [
  "HSc-11 - Science",
  "B.Sc. - NURSING",
  "B.Tech. - Computer",
  "BAMS - MEDICAL",
  "B.Tech. - Instrument and Control",
  "B.Tech. - Information & Technology",
  "B.Pharm - Pharmacy",
  "B.Tech. - Chemical Engineering",
  "B.Tech. - Electronics & Communication",
  "B.E. - Electronics and Communication",
  "BHMS - --",
  "B.E. - Computer",
  "Diploma - Chemical",
  "B.Tech. - Civil Engineering",
  "B.Tech. - Chemical",
  "B.E. - Chemical",
  "BBA - --",
  "BCA - --",
  "MBBS - MEDICAL",
  "M.S. - Ayurveda",
  "B.Sc. - Biotechnology",
  "B.Sc. - IT",
  "B.Tech. - Mechanical",
  "B.Tech. - Civil",
  "B.E. - Information and Technology",
  "B.Sc. - BioChemistry",
  "B.E. - Civil",
  "MCA - --",
  "BDS - --",
  "HSc-11 - Commerce",
  "M.E. - Mechanical",
  "B.Sc. - Microbiology",
  "MBA - --",
  "Agri. - Agriculture",
  "AI&ML - -",
  "B.E. - Mechanical",
  "B.E. - Electrical",
  "B.Tech. - Electrical",
  "B.Tech. - Mechanical Engineering"
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
    "Chhota Udaipur",
    "Dahod",
    "Dang",
    "Devbhumi Dwarka",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kheda",
    "Kutch",
    "Mahisagar",
    "Mehsana",
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
    "Dadra & Nagar Haveli"
]

const TALUKAS = [
  "Abdasa",
    "Ahmedabad",
    "Ahwa",
    "Amirgadh",
    "Amod",
    "Amreli",
    "Anand",
    "Anjar",
    "Anklav",
    "Ankleshwar",
    "Babra",
    "Bagasara",
    "Balasinor",
    "Bardoli",
    "Barwala",
    "Bavla",
    "Bayad",
    "Becharaji",
    "Bhabhar",
    "Bhachau",
    "Bhanvad",
    "Bharuch",
    "Bhavnagar",
    "Bhesan",
    "Bhiloda",
    "Bhuj",
    "Bodeli",
    "Borsad",
    "Botad",
    "Chanasma",
    "Chhota Udaipur",
    "Chikhli",
    "Choryasi",
    "Chotila",
    "Chuda",
    "Dabhoi",
    "Dahod",
    "Danta",
    "Dantiwada",
    "Dasada",
    "Daskroi",
    "Dediapada",
    "Deesa",
    "Dehgam",
    "Deodar",
    "Desar",
    "Detroj-Rampura",
    "Devgadhbaria",
    "Dhandhuka",
    "Dhanera",
    "Dhanpur",
    "Dhansura",
    "Dharampur",
    "Dhari",
    "Dholera",
    "Dholka",
    "Dhoraji",
    "Dhrangadhra",
    "Dhrol",
    "Fatepura",
    "Gadhada",
    "Galteshwar",
    "Gandevi",
    "Gandhidham",
    "Gandhinagar",
    "Garbada",
    "Gariadhar",
    "Garudeshwar",
    "Ghogha",
    "Ghoghamba",
    "Gir Gadhada",
    "Godhra",
    "Gondal",
    "Halol",
    "Halvad",
    "Hansot",
    "Harij",
    "Himatnagar",
    "Idar",
    "Jafrabad",
    "Jalalpore",
    "Jambughoda",
    "Jambusar",
    "Jamjodhpur",
    "Jamkandorna",
    "Jamnagar",
    "Jasdan",
    "Jeshar",
    "Jetpur",
    "Jetpur-Pavi",
    "Jhagadia",
    "Jhalod",
    "Jodiya",
    "Jotana",
    "Junagadh",
    "Kadana",
    "Kadi",
    "Kalavad",
    "Kalol",
    "Kalol",
    "Kalyanpur",
    "Kamrej",
    "Kankrej",
    "Kapadvanj",
    "Kaprada",
    "Karjan",
    "Kathlal",
    "Kavant",
    "Keshod",
    "Khambha",
    "Khambhalia",
    "Khambhat",
    "Khanpur",
    "Kheda",
    "Khedbrahma",
    "Kheralu",
    "Khergam",
    "Kodinar",
    "Kotda Sangani",
    "Kunkavav-Vadia",
    "Kutiyana",
    "Lakhani",
    "Lakhpat",
    "Lakhtar",
    "Lalpur",
    "Lathi",
    "Lilia",
    "Limbdi",
    "Limkheda",
    "Lodhika",
    "Lunawada",
    "Mahemdavad",
    "Mahudha",
    "Mahuva",
    "Mahuva",
    "Malia",
    "Maliya",
    "Malpur",
    "Manavadar",
    "Mandal",
    "Mandvi",
    "Mandvi",
    "Mangrol",
    "Mangrol",
    "Mansa",
    "Matar",
    "Meghraj",
    "Mehsana",
    "Mendarda",
    "Modasa",
    "Morbi",
    "Morwa (Hadaf)",
    "Muli",
    "Mundra",
    "Nadiad",
    "Nakhatrana",
    "Nandod",
    "Naswadi",
    "Navsari",
    "Netrang",
    "Nizar",
    "Okhamandal",
    "Olpad",
    "Paddhari",
    "Padra",
    "Palanpur",
    "Palitana",
    "Palsana",
    "Pardi",
    "Patan",
    "Petlad",
    "Porbandar",
    "Poshina",
    "Prantij",
    "Radhanpur",
    "Rajkot",
    "Rajula",
    "Ranavav",
    "Ranpur",
    "Rapar",
    "Sagbara",
    "Sami",
    "Sanand",
    "Sanjeli",
    "Sankheda",
    "Sankheshwar",
    "Santalpur",
    "Santrampur",
    "Saraswati",
    "Satlasana",
    "Savarkundla",
    "Savli",
    "Sayla",
    "Shehera",
    "Sidhpur",
    "Sihor",
    "Sinor",
    "Sojitra",
    "Songadh",
    "Subir",
    "Suigam",
    "Surat",
    "Sutrapada",
    "Talaja",
    "Talala",
    "Talod",
    "Tankara",
    "Tarapur",
    "Thangadh",
    "Tharad",
    "Thasra",
    "Tilakwada",
    "Uchchhal",
    "Umargam",
    "Umarpada",
    "Umrala",
    "Umreth",
    "Una",
    "Unjha",
    "Upleta",
    "Vadali",
    "Vadgam",
    "Vadnagar",
    "Vadodara",
    "Vaghodia",
    "Vagra",
    "Valia",
    "Vallabhipur",
    "Valod",
    "Valsad",
    "Vansda",
    "Vanthali",
    "Vapi",
    "Vaso",
    "Vav",
    "Veraval",
    "Vijapur",
    "Vijaynagar",
    "Vinchhiya",
    "Viramgam",
    "Virpur",
    "Visavadar",
    "Visnagar",
    "Vyara",
    "Wadhwan",
    "Waghai",
    "Wankaner",
    "Dadra & Nagar Haveli"
]

const PINCODES = [
  "383001", "383002", "383006", "383010", "383030", "383110", "383120", "383205", "383210", "383215", 
      "383220", "383225", "383230", "383235", "383240", "383246", "383255", "383270", "383275", "383276", 
      "383305", "383307", "383410", "383421", "383422", "383430", "383434", "383440", "383450", "383460", 
      "383462", "387305",
      "363423", "380001", "380002", "380003", "380004", "380005", "380006", "380007", "380008", "380009", 
      "380013", "380014", "380015", "380016", "380018", "380019", "380021", "380022", "380023", "380024", 
      "380026", "380027", "380028", "380049", "380050", "380051", "380052", "380054", "380055", "380058", 
      "380059", "380060", "380061", "380063", "382110", "382115", "382120", "382130", "382140", "382145", 
      "382150", "382170", "382210", "382213", "382220", "382225", "382230", "382240", "382245", "382250", 
      "382260", "382265", "382308", "382330", "382340", "382345", "382350", "382405", "382415", "382418", 
      "382421", "382424", "382425", "382427", "382428", "382430", "382433", "382435", "382443", "382445", 
      "382449", "382450", "382455", "382460", "382463", "382465", "382470", "382475", "382480", "382481", 
      "382722",
      "382115", "382120", "382170", "384001", "384002", "384003", "384005", "384012", "384120", "384130", 
      "384135", "384140", "384160", "384170", "384260", "384305", "384310", "384315", "384320", "384325", 
      "384330", "384335", "384340", "384345", "384355", "384360", "384410", "384412", "384415", "384421", 
      "384430", "384435", "384440", "384441", "384445", "384450", "384455", "384460", "384465", "384470", 
      "384515", "384520", "384530", "384540", "384550", "384560", "384565", "384570",
      "385001", "385010", "385110", "385120", "385130", "385135", "385210", "385310", "385320", "385330", 
      "385410", "385421", "385505", "385506", "385510", "385515", "385520", "385530", "385535", "385540", 
      "385545", "385550", "385555", "385560", "385565", "385566", "385570", "385575",
      "382006", "382007", "382010", "382016", "382021", "382024", "382028", "382030", "382041", "382042", 
      "382045", "382115", "382122", "382220", "382305", "382308", "382315", "382320", "382321", "382330", 
      "382355", "382421", "382422", "382423", "382424", "382426", "382610", "382620", "382630", "382640", 
      "382650", "382721", "382722", "382725", "382729", "382735", "382740", "382810", "382835", "382845", 
      "382855",
      "384110", "384151", "384220", "384221", "384225", "384229", "384230", "384240", "384241", "384245", 
      "384246", "384255", "384260", "384265", "384272", "384275", "384285", "384290", "385340", "385350", 
      "385360",
      "391120", "393025", "393040", "393041", "393050", "393120", "393130", "393140", "393145", "393150", 
      "393151",
      "391810", "392001", "392011", "392012", "392015", "392020", "392025", "392030", "392035", "392040", 
      "392110", "392130", "392135", "392140", "392150", "392155", "392160", "392165", "392170", "392180", 
      "392210", "392215", "392220", "392230", "392240", "393001", "393002", "393010", "393017", "393020", 
      "393030", "393105", "393110", "393115", "393120", "393125", "393130", "393135", "393140", "394115", 
      "394120", "394810",
      "390001", "390002", "390003", "390004", "390006", "390007", "390009", "390010", "390011", "390012", 
      "390013", "390014", "390016", "390017", "390018", "390019", "390020", "390021", "390022", "390023", 
      "390024", "390025", "391101", "391105", "391107", "391110", "391115", "391210", "391220", "391240", 
      "391243", "391244", "391250", "391310", "391320", "391330", "391340", "391345", "391350", "391410", 
      "391421", "391430", "391440", "391445", "391450", "391510", "391520", "391530", "391740", "391745", 
      "391750", "391760", "391761", "391770", "391774", "391775", "391776", "391780", "392220", "392310", 
      "393105",
      "387115", "387210", "387220", "387240", "387310", "387375", "387380", "387530", "387710", "388001", 
      "388110", "388120", "388121", "388130", "388140", "388150", "388160", "388170", "388180", "388205", 
      "388210", "388215", "388220", "388305", "388306", "388307", "388310", "388315", "388320", "388325", 
      "388330", "388335", "388340", "388345", "388350", "388355", "388360", "388365", "388370", "388410", 
      "388421", "388430", "388440", "388450", "388460", "388465", "388470", "388480", "388510", "388520", 
      "388530", "388540", "388543", "388545", "388550", "388560", "388570", "388580", "388590", "388610", 
      "388620", "388625", "388630", "388640",
      "387001", "387002", "387003", "387110", "387115", "387120", "387130", "387210", "387230", "387305", 
      "387315", "387320", "387325", "387330", "387335", "387340", "387345", "387350", "387355", "387360", 
      "387365", "387370", "387375", "387380", "387411", "387430", "387510", "387520", "387530", "387540", 
      "387550", "387560", "387570", "387610", "387620", "387630", "387635", "387640", "387650", "387710", 
      "388180", "388215", "388220", "388225", "388230", "388235", "388239", "388245", "388250", "388255", 
      "388440",
      "396040", "396051", "396060", "396110", "396310", "396321", "396325", "396350", "396360", "396370", 
      "396380", "396403", "396406", "396409", "396412", "396415", "396418", "396421", "396424", "396427", 
      "396430", "396433", "396436", "396439", "396440", "396445", "396450", "396460", "396463", "396466", 
      "396469", "396472", "396475", "396521", "396530", "396540", "396560", "396570", "396580", "396590",
      "364515", "364521", "364522", "364525", "364530", "365220", "365410", "365421", "365430", "365435", 
      "365440", "365450", "365455", "365456", "365460", "365480", "365535", "365540", "365541", "365550", 
      "365555", "365560", "365601", "365610", "365620", "365630", "365635", "365640", "365645", "365650", 
      "365730",
      "364001", "364002", "364003", "364004", "364005", "364006", "364050", "364060", "364070", "364081", 
      "364110", "364120", "364130", "364135", "364140", "364145", "364150", "364210", "364230", "364240", 
      "364250", "364260", "364265", "364270", "364275", "364280", "364290", "364295", "364310", "364313", 
      "364320", "364330", "364505", "364510", "364525", "364530", "364740", "364760",
      "360001", "360002", "360003", "360004", "360005", "360006", "360007", "360020", "360021", "360022", 
      "360023", "360024", "360025", "360026", "360028", "360030", "360035", "360040", "360045", "360050", 
      "360055", "360060", "360070", "360110", "360311", "360320", "360325", "360330", "360360", "360370", 
      "360375", "360380", "360405", "360410", "360421", "360430", "360440", "360450", "360452", "360460", 
      "360465", "360470", "360480", "360485", "360490", "363440", "363520", "363650", "365480",
      "360003", "363330", "363351", "363621", "363623", "363630", "363641", "363642", "363643", "363650", 
      "363655", "363660", "363670",
      "363410", "363421", "364120", "364320", "364710", "364720", "364730", "364740", "364750", "364760", 
      "364765", "382245", "382250", "382255", "382450",
      "383245", "383246", "383250", "383251", "383260", "383276", "383307", "383310", "383315", "383316", 
      "383317", "383320", "383325", "383330", "383335", "383340", "383345", "383350", "383355", "383450",
      "363001", "363002", "363020", "363030", "363035", "363040", "363110", "363115", "363310", "363320", 
      "363330", "363410", "363421", "363423", "363427", "363430", "363435", "363440", "363510", "363520", 
      "363530", "363745", "363750", "363755", "363760", "363765", "363775", "363780", "382130",
      "360490", "362001", "362002", "362011", "362015", "362020", "362030", "362037", "362110", "362120", 
      "362130", "362135", "362150", "362205", "362215", "362220", "362222", "362225", "362226", "362227", 
      "362230", "362240", "362245", "362250", "362255", "362260", "362263", "362310", "362315", "362610", 
      "362620", "362625", "362630", "362640", "362650", "365440",
      "362135", "362140", "362150", "362255", "362265", "362268", "362275", "362510", "362530", "362550", 
      "362560", "362565", "362710", "362715", "362720",
      "360490", "360545", "360550", "360570", "360575", "360576", "360577", "360578", "360579", "360590", 
      "362230", "362620", "362650",
      "391110", "391125", "391130", "391135", "391140", "391145", "391150", "391152", "391156", "391160", 
      "391165", "391168", "391170", "391761",
      "360510", "360515", "360590", "361010", "361305", "361306", "361310", "361315", "361320", "361325", 
      "361330", "361335", "361345", "361347", "361350",
      "360110", "360405", "360480", "360490", "360520", "360530", "360531", "360540", "361001", "361002", 
      "361003", "361004", "361005", "361006", "361007", "361008", "361009", "361010", "361011", "361012", 
      "361013", "361110", "361120", "361130", "361140", "361142", "361150", "361160", "361162", "361170", 
      "361210", "361220", "361230", "361240", "361250", "361280", "363655",
      "394101", "394105", "394107", "394110", "394111", "394112", "394120", "394125", "394130", "394140", 
      "394150", "394155", "394160", "394163", "394170", "394180", "394185", "394190", "394210", "394221", 
      "394230", "394235", "394240", "394245", "394246", "394248", "394250", "394270", "394305", "394310", 
      "394315", "394317", "394320", "394325", "394326", "394327", "394330", "394335", "394340", "394345", 
      "394350", "394352", "394355", "394360", "394405", "394410", "394421", "394430", "394440", "394445", 
      "394510", "394515", "394516", "394517", "394518", "394520", "394530", "394540", "394541", "394550", 
      "394601", "394620", "394651", "395001", "395002", "395003", "395004", "395005", "395006", "395007", 
      "395008", "395009", "395010", "395011", "395012", "395013", "395017", "395023", "396510",
      "388710", "388713", "389001", "389002", "389110", "389115", "389120", "389210", "389220", "389310", 
      "389320", "389330", "389340", "389341", "389350", "389360", "389365", "389370", "389380", "389390",
      "388235", "388255", "388260", "388265", "388270", "389110", "389172", "389190", "389210", "389220", 
      "389230", "389232", "389235", "389250", "389260", "389265",
      "370001", "370015", "370020", "370030", "370040", "370105", "370110", "370115", "370130", "370135", 
      "370140", "370145", "370150", "370155", "370160", "370165", "370201", "370203", "370205", "370210", 
      "370230", "370240", "370405", "370410", "370415", "370421", "370425", "370427", "370430", "370435", 
      "370445", "370450", "370455", "370460", "370465", "370475", "370485", "370490", "370510", "370601", 
      "370605", "370610", "370615", "370620", "370625", "370627", "370630", "370641", "370645", "370650", 
      "370655", "370660", "370665", "370670", "370675",
      "396001", "396002", "396007", "396020", "396030", "396035", "396045", "396050", "396051", "396055", 
      "396065", "396067", "396105", "396115", "396120", "396125", "396126", "396130", "396135", "396140", 
      "396145", "396150", "396155", "396165", "396170", "396171", "396180", "396185", "396191", "396193", 
      "396195", "396215", "396230", "396235", "396240", "396375", "396385",
      "394246", "394250", "394340", "394360", "394365", "394370", "394375", "394380", "394620", "394630", 
      "394633", "394635", "394640", "394641", "394650", "394651", "394652", "394655", "394660", "394670", 
      "394680", "394690", "394716",
      "394710", "394715", "394716", "394720", "394730",
      "389130", "389140", "389146", "389151", "389152", "389154", "389155", "389160", "389170", "389172", 
      "389175", "389180", "389190", "389380", "389382"
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

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateDetailsInput>({
    resolver: zodResolver(updateDetailsSchema),
    defaultValues: {
      roll_no: student.roll_no || "",
      name: student.name || "",
      date_of_birth: student.date_of_birth ? student.date_of_birth.split("T")[0] : "",
      mobile_number: student.mobile_number || "",
      email: student.email || "",
      father_mobile_number: student.father_mobile_number || "",
      field_of_study: student.field_of_study || "",
      address: student.address || "",
      taluka: student.taluka || "",
      city: student.city || "",
      district: student.district || "",
      pincode: student.pincode || "",
    },
  })

  // Watch form values for changes
  const formValues = watch()

  // Check if there are any actual changes in the data
  useEffect(() => {
    // Filter out roll_no since it's read-only
    const { roll_no, ...currentValues } = formValues
    const { roll_no: origRoll, ...originalValues } = {
      roll_no: student.roll_no || "",
      name: student.name || "",
      date_of_birth: student.date_of_birth ? student.date_of_birth.split("T")[0] : "",
      mobile_number: student.mobile_number || "",
      email: student.email || "",
      father_mobile_number: student.father_mobile_number || "",
      field_of_study: student.field_of_study || "",
      address: student.address || "",
      taluka: student.taluka || "",
      city: student.city || "",
      district: student.district || "",
      pincode: student.pincode || "",
    }

    setHasChanges(!isEqual(currentValues, originalValues))
  }, [formValues, student])

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

  // Custom improved searchable dropdown component
  const SearchableDropdown = ({
    name,
    label,
    options,
    control,
    errors,
    placeholder = "Select an option"
  }: {
    name: keyof UpdateDetailsInput
    label: string
    options: string[]
    control: Control<UpdateDetailsInput>
    errors: FieldErrors<UpdateDetailsInput>
    placeholder?: string
  }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    
    // Filter options based on search term
    const filteredOptions = options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
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
              <>
                <div 
                  className="flex items-center border rounded-md focus-within:border-blue-300 px-3 py-2 cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span className={`flex-grow ${field.value ? "" : "text-gray-400"}`}>
                    {field.value || placeholder}
                  </span>
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                
                {isOpen && (
                  <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg">
                    <div className="p-2 border-b">
                      <Input
                        placeholder={`Search ${label.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="border focus:border-blue-300"
                        autoComplete="off"
                        autoFocus
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                          <div
                            key={option}
                            className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                              field.value === option ? "bg-blue-100" : ""
                            }`}
                            onClick={() => {
                              field.onChange(option)
                              setIsOpen(false)
                              setSearchTerm("")
                            }}
                          >
                            {option}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No options found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          />
        </div>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]?.message}</p>}
      </div>
    )
  }

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

              {/* District Dropdown with Search */}
              <SearchableDropdown
                name="district"
                label="District"
                options={DISTRICTS}
                control={control}
                errors={errors}
                placeholder="Select district"
              />

              {/* Taluka Dropdown with Search */}
              <SearchableDropdown
                name="taluka"
                label="Taluka"
                options={TALUKAS}
                control={control}
                errors={errors}
                placeholder="Select taluka"
              />

              {/* City Field - Manual Entry */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700">
                  City
                </Label>
                <Input id="city" {...register("city")} className="focus:border-blue-300" placeholder="Enter your city" />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
              </div>

              {/* Pincode Dropdown with Search */}
              <SearchableDropdown
                name="pincode"
                label="Pincode"
                options={PINCODES}
                control={control}
                errors={errors}
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

// v2
// "use client"

// import type React from "react"
// import { useState, useEffect, useRef } from "react"
// import { useStudentStore } from "../store/studentStore"
// import { updateStudentData } from "../services/api"
// import { Card, CardContent } from "./ui/card"
// import { Input } from "./ui/input"
// import { Button } from "./ui/button"
// import { Label } from "./ui/label"
// import { Textarea } from "./ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
// import { Alert, AlertDescription } from "./ui/alert"
// import { AlertCircle, CheckCircle2, Info, Search } from "lucide-react"
// import { useForm, Controller } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { updateDetailsSchema, type UpdateDetailsInput } from "../validation/schemas"
// import { isEqual } from "lodash"

// // Field of study options with BTech Computer merged
// const FIELD_OPTIONS = [
//   "BTech Computer", // Merged field
//   "Engineering",
//   "Medicine",
//   "Arts",
//   "Science",
//   "Commerce",
//   "Law",
// ]

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
// }

// // Define separate lists for districts and talukas
// const DISTRICTS = [
//   "Ahmedabad",
//   "Amreli",
//   "Anand",
//   "Aravalli",
//   "Banaskantha",
//   "Bharuch",
//   "Bhavnagar",
//   "Botad",
//   "Chhota Udepur",
//   "Dahod",
//   "Dang",
//   "Devbhumi Dwarka",
//   "Gandhinagar",
//   "Gir Somnath",
//   "Jamnagar",
//   "Junagadh",
//   "Kachchh",
//   "Kheda",
//   "Mahesana",
//   "Mahisagar",
//   "Morbi",
//   "Narmada",
//   "Navsari",
//   "Panchmahal",
//   "Patan",
//   "Porbandar",
//   "Rajkot",
//   "Sabarkantha",
//   "Surat",
//   "Surendranagar",
//   "Tapi",
//   "Vadodara",
//   "Valsad",
// ]

// const TALUKAS = [
//   "Ahmedabad City",
//   "Daskroi",
//   "Detroj-Rampura",
//   "Dholka",
//   "Dhandhuka",
//   "Sanand",
//   "Viramgam",
//   "Bavla",
//   "Amreli",
//   "Lathi",
//   "Lilia",
//   "Savarkundla",
//   "Khambha",
//   "Jafrabad",
//   "Rajula",
//   "Bagasara",
//   "Dhari",
//   "Kunkavav",
//   "Vadia",
//   "Anand",
//   "Petlad",
//   "Sojitra",
//   "Khambhat",
//   "Borsad",
//   "Anklav",
//   "Tarapur",
//   "Umreth",
//   "Modasa",
//   "Dhansura",
//   "Malpur",
//   "Meghraj",
//   "Bayad",
//   "Bhiloda",
//   "Palanpur",
//   "Vadgam",
//   "Danta",
//   "Amirgadh",
//   "Dantiwada",
//   "Deesa",
//   "Dhanera",
//   "Kankrej",
//   "Tharad",
//   "Vav",
//   "Bharuch",
//   "Amod",
//   "Jambusar",
//   "Jhagadia",
//   "Ankleshwar",
//   "Hansot",
//   "Valia",
//   "Bhavnagar",
//   "Ghogha",
//   "Sihor",
//   "Palitana",
//   "Umrala",
//   "Gariadhar",
//   "Mahuva",
//   "Talaja",
//   "Botad",
//   "Barwala",
//   "Gadhada",
//   "Ranpur",
//   "Chhota Udaipur",
//   "Jetpur",
//   "Pavi Bodeli",
//   "Kavant",
//   "Naswadi",
//   "Sankheda",
//   "Dahod",
//   "Limkheda",
//   "Zalod",
//   "Garbada",
//   "Dhanpur",
//   "Devgad Baria",
//   "Fatepura",
//   "Ahwa",
//   "Waghai",
//   "Subir",
//   "Khambhalia",
//   "Bhanvad",
//   "Kalyanpur",
//   "Dwarka",
//   "Gandhinagar",
//   "Dehgam",
//   "Mansa",
//   "Kalol",
//   "Veraval",
//   "Kodinar",
//   "Una",
//   "Talala",
//   "Sutrapada",
//   "Gir Gadhada",
//   "Jamnagar",
//   "Kalavad",
//   "Dhrol",
//   "Jodiya",
//   "Jamjodhpur",
//   "Lalpur",
//   "Junagadh",
//   "Mangrol",
//   "Manavadar",
//   "Malia",
//   "Visavadar",
//   "Bhesan",
//   "Vanthali",
//   "Keshod",
//   "Kheda",
//   "Kapadvanj",
//   "Mehmedabad",
//   "Mahudha",
//   "Matar",
//   "Thasra",
//   "Nadiad",
//   "Vaso",
//   "Galteshwar",
//   "Bhuj",
//   "Anjar",
//   "Gandhidham",
//   "Mandvi",
//   "Mundra",
//   "Nakhatrana",
//   "Abdasa",
//   "Lakhpat",
//   "Rapar",
//   "Lunawada",
//   "Santrampur",
//   "Kadana",
//   "Khanpur",
//   "Balasinor",
//   "Virpur",
//   "Mehsana",
//   "Kadi",
//   "Vijapur",
//   "Visnagar",
//   "Becharaji",
//   "Satlasana",
//   "Kheralu",
//   "Unjha",
//   "Morbi",
//   "Tankara",
//   "Wankaner",
//   "Halvad",
//   "Maliya",
//   "Rajpipla",
//   "Garudeshwar",
//   "Nandod",
//   "Sagbara",
//   "Tilakwada",
//   "Dediapada",
//   "Navsari",
//   "Jalalpore",
//   "Gandevi",
//   "Chikhli",
//   "Khergam",
//   "Vansda",
//   "Godhra",
//   "Lunawada",
//   "Morwa Hadaf",
//   "Shehera",
//   "Khanpur",
//   "Santrampur",
//   "Halol",
//   "Kalol",
//   "Patan",
//   "Siddhpur",
//   "Chanasma",
//   "Sami",
//   "Harij",
//   "Radhanpur",
//   "Santalpur",
//   "Porbandar",
//   "Ranavav",
//   "Kutiyana",
//   "Rajkot",
//   "Lodhika",
//   "Jasdan",
//   "Kotda Sangani",
//   "Gondal",
//   "Jetpur",
//   "Dhoraji",
//   "Paddhari",
//   "Himatnagar",
//   "Idar",
//   "Khedbrahma",
//   "Poshina",
//   "Vadali",
//   "Talod",
//   "Prantij",
//   "Bayad",
//   "Surat City",
//   "Choryasi",
//   "Olpad",
//   "Mandvi",
//   "Mangrol",
//   "Umarpada",
//   "Bardoli",
//   "Kamrej",
//   "Mahuva",
//   "Surendranagar",
//   "Wadhwan",
//   "Limbdi",
//   "Chotila",
//   "Sayla",
//   "Thangadh",
//   "Lakhtar",
//   "Dhrangadhra",
//   "Halvad",
//   "Vyara",
//   "Songadh",
//   "Uchchhal",
//   "Nizar",
//   "Dolvan",
//   "Kukarmunda",
//   "Valod",
//   "Vadodara",
//   "Savli",
//   "Karjan",
//   "Dabhoi",
//   "Padra",
//   "Sinor",
//   "Desar",
//   "Valsad",
//   "Pardi",
//   "Umbergaon",
//   "Kaprada",
//   "Dharampur",
// ]

// // Extract these from your data
// const CITIES = [
//   "Ahmedabad",
//   "Amreli",
//   "Anand",
//   "Bharuch",
//   "Bhavnagar",
//   "Bhuj",
//   "Gandhinagar",
//   "Jamnagar",
//   "Junagadh",
//   "Mehsana",
//   "Nadiad",
//   "Navsari",
//   "Rajkot",
//   "Surat",
//   // Add more cities as needed
// ]

// const PINCODES = [
//   "360001",
//   "360002",
//   "360003",
//   "360004",
//   "360005",
//   "360006",
//   "360007",
//   "360020",
//   "361001",
//   "361002",
//   "361003",
//   "361004",
//   "361005",
//   "362001",
//   "362002",
//   "362011",
//   // Add more pincodes as needed
// ]

// interface UpdateDetailsFormProps {
//   onCancel: () => void
//   onUpdate: () => void
// }

// const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({ onCancel, onUpdate }) => {
//   const student = useStudentStore()

//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)
//   const [hasChanges, setHasChanges] = useState(false)
//   const [showGuidelines, setShowGuidelines] = useState(false)
//   const [showCustomCity, setShowCustomCity] = useState(false)

//   // Search filters for dropdowns
//   const [districtFilter, setDistrictFilter] = useState("")
//   const [talukaFilter, setTalukaFilter] = useState("")
//   // const [cityFilter, setCityFilter] = useState("")
//   const [pincodeFilter, setPincodeFilter] = useState("")
//   const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false)
//   const [isTalukaDropdownOpen, setIsTalukaDropdownOpen] = useState(false)
//   const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
//   const [isPincodeDropdownOpen, setIsPincodeDropdownOpen] = useState(false)

//   const {
//     control,
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isDirty },
//   } = useForm<UpdateDetailsInput>({
//     resolver: zodResolver(updateDetailsSchema),
//     defaultValues: {
//       roll_no: student.roll_no || "",
//       name: student.name || "",
//       date_of_birth: student.date_of_birth ? student.date_of_birth.split("T")[0] : "",
//       mobile_number: student.mobile_number || "",
//       email: student.email || "",
//       father_mobile_number: student.father_mobile_number || "",
//       field_of_study: student.field_of_study || "",
//       // branch is removed
//       address: student.address || "",
//       taluka: student.taluka || "",
//       city: student.city || "", // New city field
//       district: student.district || "",
//       pincode: student.pincode || "",
//     },
//   })

//   // Watch form values for changes
//   const formValues = watch()

//   // Effect to check if city needs custom input
//   useEffect(() => {
//     if (student.city && !CITIES.includes(student.city)) {
//       setShowCustomCity(true)
//     }
//   }, [student.city])

//   // Check if there are any actual changes in the data
//   useEffect(() => {
//     // Filter out roll_no since it's read-only
//     const { roll_no, ...currentValues } = formValues
//     const { roll_no: origRoll, ...originalValues } = {
//       roll_no: student.roll_no || "",
//       name: student.name || "",
//       date_of_birth: student.date_of_birth ? student.date_of_birth.split("T")[0] : "",
//       mobile_number: student.mobile_number || "",
//       email: student.email || "",
//       father_mobile_number: student.father_mobile_number || "",
//       field_of_study: student.field_of_study || "",
//       // branch is removed
//       address: student.address || "",
//       taluka: student.taluka || "",
//       city: student.city || "", // New city field
//       district: student.district || "",
//       pincode: student.pincode || "",
//     }

//     setHasChanges(!isEqual(currentValues, originalValues))
//   }, [formValues, student])

//   // Filtered lists for dropdowns
//   const filteredDistricts = DISTRICTS.filter((district) =>
//     district.toLowerCase().includes(districtFilter.toLowerCase()),
//   )

//   const filteredTalukas = TALUKAS.filter((taluka) => taluka.toLowerCase().includes(talukaFilter.toLowerCase()))

//   // const filteredCities = CITIES.filter((city) => city.toLowerCase().includes(cityFilter.toLowerCase()))

//   const filteredPincodes = PINCODES.filter((pincode) => pincode.includes(pincodeFilter))

//   const onSubmit = async (data: UpdateDetailsInput) => {
//     // If no changes, show message and return
//     if (!hasChanges) {
//       setSuccess("No changes detected in your data.")
//       setTimeout(() => {
//         setSuccess(null)
//       }, 3000)
//       return
//     }

//     setLoading(true)
//     setError(null)
//     setSuccess(null)

//     try {
//       const updatedData = await updateStudentData(student.roll_no, data)

//       // Check if mobile number was changed
//       const mobileChanged = data.mobile_number !== student.mobile_number

//       student.setStudentData({
//         ...updatedData,
//         is_data_verified: false,
//         is_mobile_verified: !mobileChanged && student.is_mobile_verified,
//       })

//       setSuccess("Your details have been saved successfully.")

//       // Give user time to see success message before continuing
//       setTimeout(() => {
//         onUpdate()
//       }, 1500)
//     } catch (err: any) {
//       console.error("Failed to update data:", err)
//       setError(err.response?.data?.error || "Update failed. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Create a reusable dropdown component with search functionality
//   // Create a reusable dropdown component with search functionality
//   const SearchableDropdown = ({
//     name,
//     label,
//     options,
//     filter,
//     setFilter,
//     placeholder,
//     isOpen,
//     setIsOpen,
//   }: {
//     name: keyof UpdateDetailsInput
//     label: string
//     options: string[]
//     filter: string
//     setFilter: (value: string) => void
//     placeholder: string
//     isOpen: boolean
//     setIsOpen: (value: boolean) => void
//   }) => {
//     const dropdownRef = useRef<HTMLDivElement>(null)

//     // Close dropdown when clicking outside
//     useEffect(() => {
//       const handleClickOutside = (event: MouseEvent) => {
//         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//           setIsOpen(false)
//         }
//       }
//       document.addEventListener("mousedown", handleClickOutside)
//       return () => {
//         document.removeEventListener("mousedown", handleClickOutside)
//       }
//     }, [setIsOpen])

//     return (
//       <div className="space-y-2">
//         <Label htmlFor={name.toString()} className="text-gray-700">
//           {label}
//         </Label>
//         <div className="relative" ref={dropdownRef}>
//           <Controller
//             name={name}
//             control={control}
//             render={({ field }) => {
//               return (
//                 <div>
//                   <div className="flex items-center relative">
//                     <Input
//                       placeholder={placeholder}
//                       value={filter}
//                       onChange={(e) => {
//                         const newValue = e.target.value
//                         setFilter(newValue)
//                         if (!isOpen && newValue) setIsOpen(true)
//                       }}
//                       onFocus={() => setIsOpen(true)}
//                       className="focus:border-blue-300 w-full pr-8"
//                     />
//                     <Search className="h-4 w-4 text-gray-500 absolute right-3" />
//                   </div>

//                   {isOpen && (
//                     <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
//                       {options.length > 0 ? (
//                         options.map((option) => (
//                           <div
//                             key={option}
//                             className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
//                               field.value === option ? "bg-blue-100" : ""
//                             }`}
//                             onClick={() => {
//                               field.onChange(option)
//                               setFilter(option)
//                               setIsOpen(false)
//                             }}
//                           >
//                             {option}
//                           </div>
//                         ))
//                       ) : (
//                         <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )
//             }}
//           />
//         </div>
//         {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]?.message}</p>}
//       </div>
//     )
//   }

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as Node
//       const dropdowns = document.querySelectorAll(".absolute.z-10")

//       dropdowns.forEach((dropdown) => {
//         if (!dropdown.contains(target) && !dropdown.previousElementSibling?.contains(target)) {
//           // Find and close the dropdown
//           const dropdownState = Array.from(dropdown.classList).some(
//             (cls) => cls.includes("block") && !cls.includes("hidden"),
//           )

//           if (dropdownState) {
//             // This is a hack to force React to update the state
//             document.body.click()
//           }
//         }
//       })
//     }

//     document.addEventListener("mousedown", handleClickOutside)
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside)
//     }
//   }, [])

//   // useRef for city dropdown
//   const cityDropdownRef = useRef<HTMLDivElement>(null)
//   const [citySearchTerm, setCitySearchTerm] = useState("")

//   // Close city dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
//         setIsCityDropdownOpen(false)
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside)
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside)
//     }
//   }, [])

//   const filteredCityOptions = CITIES.filter((city) => city.toLowerCase().includes(citySearchTerm.toLowerCase()))

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
//                 <h3 className="font-medium mb-2 text-gray-700">Input Guidelines:</h3>
//                 <ul className="text-sm space-y-2 text-gray-600">
//                   {Object.entries(INPUT_GUIDELINES).map(([field, guideline]) => (
//                     <li key={field} className="flex flex-col sm:flex-row sm:gap-2">
//                       <span className="font-medium text-gray-700">
//                         {field.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
//                       </span>
//                       <span>{guideline}</span>
//                     </li>
//                   ))}
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
//                 <Input id="roll_no" {...register("roll_no")} readOnly className="bg-gray-50 focus:border-blue-300" />
//                 {errors.roll_no && <p className="text-sm text-red-500 mt-1">{errors.roll_no.message}</p>}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="name" className="text-gray-700">
//                   Name
//                 </Label>
//                 <Input id="name" {...register("name")} className="focus:border-blue-300" />
//                 {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-gray-700">
//                   Email
//                 </Label>
//                 <Input id="email" type="email" {...register("email")} className="focus:border-blue-300" />
//                 {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="mobile_number" className="text-gray-700">
//                   Mobile Number
//                 </Label>
//                 <Input id="mobile_number" type="tel" {...register("mobile_number")} className="focus:border-blue-300" />
//                 {errors.mobile_number && <p className="text-sm text-red-500 mt-1">{errors.mobile_number.message}</p>}
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
//                 {errors.date_of_birth && <p className="text-sm text-red-500 mt-1">{errors.date_of_birth.message}</p>}
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
//                   <p className="text-sm text-red-500 mt-1">{errors.father_mobile_number.message}</p>
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
//                 {errors.field_of_study && <p className="text-sm text-red-500 mt-1">{errors.field_of_study.message}</p>}
//               </div>

//               {/* Searchable District Dropdown */}
//               <SearchableDropdown
//                 name="district"
//                 label="District"
//                 options={filteredDistricts}
//                 filter={districtFilter}
//                 setFilter={setDistrictFilter}
//                 placeholder="Select district"
//                 isOpen={isDistrictDropdownOpen}
//                 setIsOpen={setIsDistrictDropdownOpen}
//               />

//               {/* Searchable Taluka Dropdown */}
//               <SearchableDropdown
//                 name="taluka"
//                 label="Taluka"
//                 options={filteredTalukas}
//                 filter={talukaFilter}
//                 setFilter={setTalukaFilter}
//                 placeholder="Select taluka"
//                 isOpen={isTalukaDropdownOpen}
//                 setIsOpen={setIsTalukaDropdownOpen}
//               />

//               {/* City Field (Dropdown + Custom Input Option) */}
//               <div className="space-y-2">
//                 <Label htmlFor="city" className="text-gray-700">
//                   City
//                 </Label>
//                 {showCustomCity ? (
//                   <div className="flex">
//                     <Input id="city" {...register("city")} className="focus:border-blue-300 flex-grow" />
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
//                     <div className="flex-grow relative" ref={cityDropdownRef}>
//                       <Controller
//                         name="city"
//                         control={control}
//                         render={({ field }) => {
//                           return (
//                             <div>
//                               <div
//                                 className="flex items-center justify-between border rounded-md px-3 py-2 focus-within:border-blue-300 cursor-pointer"
//                                 onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
//                               >
//                                 <span className={field.value ? "" : "text-gray-400"}>
//                                   {field.value || "Select city"}
//                                 </span>
//                                 <Search className="h-4 w-4 text-gray-500" />
//                               </div>

//                               {isCityDropdownOpen && (
//                                 <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg">
//                                   <div className="p-2 border-b">
//                                     <Input
//                                       placeholder="Search cities..."
//                                       value={citySearchTerm}
//                                       onChange={(e) => setCitySearchTerm(e.target.value)}
//                                       className="border focus-visible:ring-1 focus-visible:ring-blue-300"
//                                       autoFocus
//                                       onClick={(e) => e.stopPropagation()}
//                                     />
//                                   </div>
//                                   <div className="max-h-60 overflow-y-auto">
//                                     {filteredCityOptions.length > 0 ? (
//                                       filteredCityOptions.map((city) => (
//                                         <div
//                                           key={city}
//                                           className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
//                                             field.value === city ? "bg-blue-100" : ""
//                                           }`}
//                                           onClick={() => {
//                                             field.onChange(city)
//                                             setIsCityDropdownOpen(false)
//                                           }}
//                                         >
//                                           {city}
//                                         </div>
//                                       ))
//                                     ) : (
//                                       <div className="px-3 py-2 text-sm text-gray-500">No cities found</div>
//                                     )}
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           )
//                         }}
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
//                 {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
//               </div>

//               {/* Searchable Pincode Dropdown */}
//               <SearchableDropdown
//                 name="pincode"
//                 label="Pincode"
//                 options={filteredPincodes}
//                 filter={pincodeFilter}
//                 setFilter={setPincodeFilter}
//                 placeholder="Select pincode"
//                 isOpen={isPincodeDropdownOpen}
//                 setIsOpen={setIsPincodeDropdownOpen}
//               />

//               <div className="space-y-2 md:col-span-2">
//                 <Label htmlFor="address" className="text-gray-700">
//                   Address
//                 </Label>
//                 <Textarea id="address" {...register("address")} rows={3} className="focus:border-blue-300" />
//                 {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
//               </div>
//             </div>

//             {error && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             {success && (
//               <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
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
//                 {loading ? "Saving..." : !hasChanges ? "No Changes" : "Save Changes"}
//               </Button>
//             </div>
//           </form>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default UpdateDetailsForm

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