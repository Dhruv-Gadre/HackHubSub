import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username:{
        type:String,
        required: true
    },
    email: {
			type: String,
			required: true,
			unique: true,
	},
    role:{
        type:String,
        default: "Doctor"
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    patients:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    location: {
        type: {
            type: String,
            enum: ["Point"], // GeoJSON type must be "Point"
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    bio:{
        type:String,
    },
    
})

doctorSchema.index({ location: "2dsphere" });

const doctor = mongoose.model("Doctor", doctorSchema);
export default doctor;