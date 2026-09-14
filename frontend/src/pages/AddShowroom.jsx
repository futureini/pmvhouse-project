import PropertyForm from "./PropertyForm";
import { axiosInstance } from "../app";
import { useNavigate } from "react-router-dom";

export default function AddShowroom(){
  const navigate = useNavigate();

  const fields = [
    { name:"shopName", label:"Shop Name", required:true },
    { name:"area", label:"Area", required:true },
    { name:"location", label:"Location", required:true },
    { name:"sqft", label:"Sqft" },
    { name:"price", label:"Monthly Rent", type:"number", required:true },
    // { name:"parking", label:"Parking (Yes/No)" },
    { name:"phone", label:"Phone", required:true }
  ];

  const submit = (data)=>{
    data.append("category","Showroom");
    return axiosInstance.post("/properties", data, {
      headers:{ Authorization:`Bearer ${localStorage.getItem("token")}` }
    });
  };

  return (
    <PropertyForm
      title="Add Showroom"
      fields={fields}
      onSubmit={submit}
      navigate={navigate}
    />
  );
}