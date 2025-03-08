import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true, minLength: 6 },
    email: { type: String, required: true, unique: true },
    grade: { type: String, enum: ['A', 'B', 'C', 'D']},
    role:{
        type:String,
        default: "Patient"
    },
    
    familyStructure: {
        values: {
            type: [Number], 
            default: [0, 0, 0, 0, 0] 
        }, 
        weights: { 
            type: Number, 
            default: 0
        }
    },
    socioEcoStats: {
        values: { 
            type: [Number], 
            default: [0, 0, 0, 0, 0] 
        },
        weights: { 
            type: Number, 
            default: 0
        }
    },
    relationship: {
        values: { 
            type: [Number], 
            default: [0, 0, 0, 0, 0] 
        },
        weights: { 
            type: Number, 
            default: 0
        }
    },
    healthSupport: {
        values: { 
            type: [Number], 
            default: [0, 0, 0, 0, 0] 
        },
        weights: { 
            type: Number, 
            default: 0
        }
    },
    sadPerson: {
        values: { 
            type: [Number], 
            default: [0, 0, 0, 0, 0] 
        },
        weights: { 
            type: Number, 
            default: 0
        }
    },
    additional: {
        values: { 
            type: [Number], 
            default: [0, 0, 0, 0, 0] 
        },
        weights: { 
            type: Number,
            default: 0 
        }
    },

    doctorDesc: { 
        type: String 
    },
    doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Doctor", 
        required: true 
    },
    
    sobrietyStreak: { 
        type: Number, 
        default: 0 
    },
    lastUpdated: { 
        type: Date, 
        default: null 
    },

    // Stores dates when the streak was continued
    streakHistory: [{ 
        type: Date
    }]
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
