import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Wheat, User, Lock, Eye, EyeOff, Shield, Loader2, Scale } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

const loginSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  rememberMe: z.boolean().optional()
})

type LoginFormValues = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shake, setShake] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employeeId: "",
      password: "",
      rememberMe: false
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true)
    setErrorMsg("")
    
    try {
      const response = await api.post('/auth/login', {
        email: data.employeeId,
        password: data.password
      })
      
      login(response)
      
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    } catch (err: any) {
      setErrorMsg(err.data?.error || "Invalid credentials")
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-stone font-sans selection:bg-turmeric/30">
      {/* Global subtle noise background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}
      />

      {/* Left Panel - Branding (40%) */}
      <div className="hidden md:flex w-[40%] bg-ink text-[#F8F9F3] flex-col justify-between p-8 xl:p-12 relative overflow-hidden border-r-4 border-brass">
        {/* Giant Watermark */}
        <Scale className="absolute -right-20 -bottom-20 w-[600px] h-[600px] text-[#F8F9F3] opacity-5 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mt-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Wheat className="text-turmeric w-12 h-12" />
            <h1 className="font-display text-4xl xl:text-5xl uppercase tracking-tight drop-shadow-stamp">
              Mandi Ledger
            </h1>
          </div>
          <h2 className="font-sans text-xl xl:text-2xl font-medium text-turmeric/90 mb-6">
            Digital Ledger for Modern Grain Businesses
          </h2>
          <p className="font-sans text-[#F8F9F3]/70 text-lg max-w-md leading-relaxed">
            Manage purchases, sales, inventory, suppliers, and reports with precision and confidence. Built for accountants and warehouse managers.
          </p>
        </motion.div>
        
        <div className="relative z-10 flex justify-between items-end text-xs font-mono text-[#F8F9F3]/50">
          <div className="flex flex-col gap-1">
            <span>© {new Date().getFullYear()} Mandi Ledger</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span>Version 1.0.0</span>
            <span>Environment: Production</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form (60%) */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 xl:p-12 relative overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile Header */}
          <div className="md:hidden mb-6 text-center flex flex-col items-center gap-2">
            <Wheat className="text-brass w-12 h-12" />
            <h1 className="font-display text-4xl uppercase tracking-tighter text-ink drop-shadow-stamp">
              Mandi Ledger
            </h1>
          </div>

          <motion.div 
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="bg-[#F8F9F3] border border-brass/50 rounded-md p-6 sm:p-8 md:p-10 shadow-[4px_4px_0px_0px_rgba(20,32,26,0.1)] relative"
          >
            <div className="mb-8">
              <h2 className="font-display text-2xl uppercase tracking-wider text-ink mb-2">Welcome Back</h2>
              <p className="font-sans text-sm text-ink/60">Sign in to access your Mandi Ledger workspace.</p>
              {errorMsg && <p className="mt-4 p-2 bg-ledger-red/10 border border-ledger-red/30 text-ledger-red text-sm font-medium rounded-sm">{errorMsg}</p>}
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="font-sans font-medium text-sm text-ink">Employee ID / Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  <input 
                    type="text" 
                    placeholder="e.g. ML-2041" 
                    disabled={isSubmitting}
                    className={`w-full h-12 pl-10 pr-4 bg-stone/50 border ${errors.employeeId ? 'border-ledger-red focus:border-ledger-red focus:ring-ledger-red/20' : 'border-brass/30 focus:border-turmeric focus:ring-turmeric/20'} font-mono text-ink text-base rounded-sm focus:outline-none focus:ring-4 transition-all disabled:opacity-50`}
                    {...register("employeeId")}
                  />
                </div>
                {errors.employeeId && <p className="text-ledger-red text-xs font-medium mt-1">{errors.employeeId.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <label className="font-sans font-medium text-sm text-ink">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    disabled={isSubmitting}
                    className={`w-full h-12 pl-10 pr-12 bg-stone/50 border ${errors.password ? 'border-ledger-red focus:border-ledger-red focus:ring-ledger-red/20' : 'border-brass/30 focus:border-turmeric focus:ring-turmeric/20'} font-mono text-ink text-base rounded-sm focus:outline-none focus:ring-4 transition-all disabled:opacity-50`}
                    {...register("password")}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink/40 hover:text-ink transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff w-4 h-4 /> : <Eye w-4 h-4 />}
                  </button>
                </div>
                {errors.password && <p className="text-ledger-red text-xs font-medium mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    disabled={isSubmitting}
                    className="w-4 h-4 border-brass/50 rounded-sm text-turmeric focus:ring-turmeric/30 bg-stone/50 cursor-pointer disabled:opacity-50"
                    {...register("rememberMe")}
                  />
                  <span className="text-sm font-sans text-ink/70 group-hover:text-ink transition-colors">Remember me</span>
                </label>
                <button type="button" disabled={isSubmitting} className="text-sm font-sans text-ink/70 hover:text-ink hover:underline transition-colors disabled:opacity-50">
                  Forgot Password?
                </button>
              </div>
              
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-turmeric text-ink font-display uppercase tracking-widest text-lg pt-1 shadow-[4px_4px_0px_0px_rgba(20,32,26,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(20,32,26,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:pointer-events-none rounded-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      SIGNING IN...
                    </>
                  ) : (
                    "SIGN IN"
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          <div className="mt-6 flex flex-col items-center gap-6 pb-8 md:pb-0">
            <div className="flex items-center justify-center gap-2 text-ink/60 font-sans text-xs sm:text-sm text-center px-4">
              <Shield className="w-4 h-4 text-paddy shrink-0" />
              <span>Your credentials are encrypted and securely transmitted.</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-sans text-ink/40 md:hidden flex-wrap justify-center">
              <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-ink transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-ink transition-colors">Support</a>
            </div>
          </div>
        </motion.div>

        {/* Desktop Footer */}
        <div className="hidden md:flex absolute bottom-6 right-8 gap-6 text-xs font-sans text-ink/40">
          <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-ink transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-ink transition-colors">support@mandiledger.com</a>
        </div>
      </div>

      {/* Demo Credentials Alert - For prototype only */}
      <div className="fixed bottom-2 left-2 md:bottom-4 md:left-4 bg-[#F8F9F3] border border-brass/30 shadow-md p-2 md:p-3 rounded-sm font-mono text-[10px] md:text-xs text-ink/70 z-50 pointer-events-none opacity-50">
        Demo: admin / password123
      </div>
    </div>
  )
}
