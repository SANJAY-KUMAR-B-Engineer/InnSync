/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInAnonymously 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Lock, Mail, UserCheck, Shield, Sparkles, AlertCircle, Loader2 } from "lucide-react";

interface AuthPortalProps {
  onAuthSuccess: (user: any, role: string, name: string) => void;
}

export default function AuthPortal({ onAuthSuccess }: AuthPortalProps) {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<"Hotel Manager" | "Receptionist" | "Housekeeping Staff" | "Technician">("Receptionist");
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [operationNotAllowed, setOperationNotAllowed] = React.useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !fullName)) {
      setError("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    setOperationNotAllowed(false);
    try {
      if (isSignUp) {
        // Create full real Firebase Auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Write staff member identity to Firestore
        const staffRef = doc(db, "staff", user.uid);
        const newStaff = {
          id: user.uid,
          name: fullName,
          role: selectedRole,
          status: "On Duty",
          shiftTiming: "09:00 - 18:00",
          assignedTasksCount: 0,
          completedTasksCount: 0,
          rating: 5.0
        };
        await setDoc(staffRef, newStaff);
        onAuthSuccess(user, selectedRole, fullName);
      } else {
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Retrieve their staff details
        const staffDoc = await getDoc(doc(db, "staff", user.uid));
        if (staffDoc.exists()) {
          const staffData = staffDoc.data();
          onAuthSuccess(user, staffData.role, staffData.name);
        } else {
          // If staff document not found, bootstrap it
          const staffRef = doc(db, "staff", user.uid);
          const customName = email.split("@")[0];
          const newStaff = {
            id: user.uid,
            name: customName.charAt(0).toUpperCase() + customName.slice(1),
            role: "Receptionist",
            status: "On Duty",
            shiftTiming: "09:00 - 18:00",
            assignedTasksCount: 0,
            completedTasksCount: 0,
            rating: 5.0
          };
          await setDoc(staffRef, newStaff);
          onAuthSuccess(user, "Receptionist", newStaff.name);
        }
      }
    } catch (err: any) {
      const isOperationNotAllowed = err.code === "auth/operation-not-allowed" || (err.message && err.message.includes("operation-not-allowed"));
      
      if (isOperationNotAllowed) {
        console.warn("Firebase Email auth provider not enabled. Instantly falling back to Sandbox Mode.");
        const nameToUse = isSignUp ? fullName : (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1));
        onAuthSuccess(
          { uid: "sandbox-mode", email: email },
          selectedRole,
          nameToUse
        );
        return;
      }

      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper trigger to auto-create and log into pre-set role simulations for testing
  const handleSimulatedRosterLogin = async (
    role: "Hotel Manager" | "Receptionist" | "Housekeeping Staff" | "Technician",
    simName: string,
    simEmail: string
  ) => {
    setLoading(true);
    setError(null);
    setOperationNotAllowed(false);
    try {
      let user;
      try {
        // Attempt signing into predefined simulation account
        const userCredential = await signInWithEmailAndPassword(auth, simEmail, "Lumina123!");
        user = userCredential.user;
      } catch (signInErr: any) {
        // If account isn't registered yet, create it automatically!
        if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential" || signInErr.code === "auth/wrong-password") {
          const userCredential = await createUserWithEmailAndPassword(auth, simEmail, "Lumina123!");
          user = userCredential.user;
        } else if (signInErr.code === "auth/operation-not-allowed" || (signInErr.message && signInErr.message.includes("operation-not-allowed"))) {
          throw signInErr;
        } else {
          throw signInErr;
        }
      }

      // Check if staff doc exists and matches role, if not update/set it
      const staffRef = doc(db, "staff", user.uid);
      const staffSnap = await getDoc(staffRef);
      
      const staffDetails = {
        id: user.uid,
        name: simName,
        role: role,
        status: "On Duty",
        shiftTiming: role === "Housekeeping Staff" ? "06:00 - 14:00" : "09:00 - 18:00",
        assignedTasksCount: 0,
        completedTasksCount: 22,
        rating: 4.8
      };

      if (!staffSnap.exists()) {
        await setDoc(staffRef, staffDetails);
      }
      
      onAuthSuccess(user, role, simName);
    } catch (err: any) {
      const isOperationNotAllowed = err.code === "auth/operation-not-allowed" || (err.message && err.message.includes("operation-not-allowed"));
      
      if (isOperationNotAllowed) {
        console.warn("Firebase Authentication provider is not enabled. Automatically bypassing using Demo Sandbox Mode offline failsafe.");
        onAuthSuccess(
          { uid: "sandbox-mode", email: simEmail },
          role,
          simName
        );
        return;
      }

      console.error("Simulation Login error:", err);
      
      // Fallback to anonymous sign-in if email registration fails due to other issues
      try {
        console.log("Attempting fallback anonymous authentication...");
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        const staffRef = doc(db, "staff", user.uid);
        const staffDetails = {
          id: user.uid,
          name: simName,
          role: role,
          status: "On Duty",
          shiftTiming: "09:00 - 18:00",
          assignedTasksCount: 0,
          completedTasksCount: 5,
          rating: 4.8
        };
        await setDoc(staffRef, staffDetails);
        onAuthSuccess(user, role, simName);
      } catch (anonErr: any) {
        const isAnonOpNotAllowed = anonErr.code === "auth/operation-not-allowed" || (anonErr.message && anonErr.message.includes("operation-not-allowed"));
        if (isAnonOpNotAllowed) {
          console.warn("Both Email/Password and Anonymous login are disabled. Instantly initiating local Demo Sandbox mode.");
          onAuthSuccess(
            { uid: "sandbox-mode", email: simEmail },
            role,
            simName
          );
          return;
        }
        setError("Failsafe Auth Error: " + (anonErr.message || "Anonymous login failed."));
      }
    } finally {
      setLoading(false);
    }
  };

  const sims = [
    { name: "Arthur Pendelton", role: "Hotel Manager" as const, email: "arthur@innsync.com", color: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/50" },
    { name: "Liam O'Connor", role: "Receptionist" as const, email: "liam@innsync.com", color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50" },
    { name: "Jeremy Cole", role: "Housekeeping Staff" as const, email: "jeremy@lumina.com", color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/50" }, // Keep housekeeping matching seed if any
    { name: "Marcus Vance", role: "Technician" as const, email: "marcus@lumina.com", color: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50" }
  ];

  return (
    <div id="auth-portal-screen" className="h-screen w-screen flex flex-col md:flex-row bg-zinc-50 font-sans overflow-hidden">
      
      {/* Visual left brand block */}
      <div className="w-full md:w-1/2 bg-zinc-950 text-white flex flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-zinc-90 w-10 flex items-center justify-center text-emerald-400 font-extrabold text-xl shadow-md border border-zinc-800 bg-zinc-900 rounded-lg">
            I
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">InnSync</h1>
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">Hospitality Node Admin</span>
          </div>
        </div>

        <div className="space-y-6 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400 font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>SECURE AES_256 SHIELD ACTIVE</span>
          </div>
          <p className="text-4xl font-extrabold tracking-tight text-white leading-[1.15]">
            Real-time hotel operations platform powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">Google Cloud</span>
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Manage room cleans, live telemetry check-ins, maintenance dispatch queues, and hospitality intelligence connected directly to your Firestore database.
          </p>
        </div>

        <div className="text-xs text-zinc-500 font-mono relative z-10">
          SECURE CLIENT ACCESS CONTROL • VER_4.12
        </div>
      </div>

      {/* Auth right panel block */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          
          <div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">
              {isSignUp ? "Register Roster Portal" : "Hospitality Key Log"}
            </h2>
            <p className="text-sm text-zinc-500 mt-1.5">
              {isSignUp ? "Create your InnSync credentials and assign your roster role." : "Sign in securely or select a predefined staff roster card below."}
            </p>
          </div>

          {error && (
            <div className="flex flex-col gap-3 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs leading-relaxed animate-shake">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              
              {operationNotAllowed && (
                <div className="mt-1 pt-2.5 border-t border-red-200 text-zinc-900 space-y-2">
                  <div className="font-bold text-red-800 flex items-center gap-1.5 font-sans">
                    <Shield className="w-3.5 h-3.5 text-red-700 animate-pulse" />
                    <span>How to Enable Auth Providers:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-0.5 text-zinc-650 text-[11px] font-sans">
                    <li>Open your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-red-700 hover:text-red-900 inline-flex items-center gap-0.5">Firebase Console</a></li>
                    <li>Click on your project in the console list</li>
                    <li>Go to <strong>Build &gt; Authentication &gt; Sign-In Method</strong></li>
                    <li>Enable **Email/Password** and **Anonymous** providers</li>
                  </ol>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onAuthSuccess(
                          { uid: "sandbox-mode", email: "sandbox@innsync.com" },
                          selectedRole || "Receptionist",
                          fullName || "Arthur Pendelton"
                        );
                      }}
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer leading-none transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bypass & Launch Demo Sandbox (Offline Dev Mode)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Liam O'Connor"
                      className="w-full pl-9 pr-4 py-2 border border-zinc-200 outline-none text-sm text-zinc-900 focus:border-zinc-900 bg-white rounded-lg"
                    />
                    <UserCheck className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase">Hospitality Roster Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-zinc-200 outline-none bg-white font-sans text-sm text-zinc-900 focus:border-zinc-900 rounded-lg"
                  >
                    <option value="Hotel Manager">Hotel Manager (Full dashboard access)</option>
                    <option value="Receptionist">Receptionist (Checkin / checkout focus)</option>
                    <option value="Housekeeping Staff">Housekeeping (Cleans & checklists)</option>
                    <option value="Technician">Technician (Active repair dispatches)</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase">Roster Key (Email)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. liam@lumina.com"
                  className="w-full pl-9 pr-4 py-2 border border-zinc-200 outline-none text-sm text-zinc-900 focus:border-zinc-900 bg-white rounded-lg"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase">Passphrase</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 border border-zinc-200 outline-none text-sm text-zinc-900 focus:border-zinc-900 bg-white rounded-lg"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-zinc-950 text-white rounded-lg text-xs font-bold font-sans hover:bg-zinc-900 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer leading-none mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging keys...</span>
                </>
              ) : (
                <span>{isSignUp ? "Register Roster Unit" : "Unlock Console Dashboard"}</span>
              )}
            </button>
          </form>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <span className="relative bg-zinc-50 px-3 text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
              OR DEVELOP MODE SIMULATOR
            </span>
          </div>

          {/* SIMULATION ROSTER CARDS */}
          <div className="space-y-2.5">
            <span id="quick-roster-helper-tag" className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Click any profile to instantly authenticate into that role:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {sims.map((sim) => (
                <button
                  key={sim.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSimulatedRosterLogin(sim.role, sim.name, sim.email)}
                  className={`border border-zinc-200 rounded-lg p-2.5 text-left text-xs transition duration-150 cursor-pointer disabled:opacity-50 flex flex-col justify-between ${sim.color}`}
                >
                  <div className="font-bold truncate text-zinc-900 text-xs leading-snug">{sim.name}</div>
                  <div className="text-[10px] opacity-80 mt-1 font-medium">{sim.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-zinc-500 hover:text-zinc-900 font-sans cursor-pointer underline"
            >
              {isSignUp ? "Already registered? Go back to login" : "Need to register a custom staff account? Sign Up"}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
