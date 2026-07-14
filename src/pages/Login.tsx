import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const loginSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID is required"),
  passcode: z.string().min(4, "Passcode must be at least 4 characters")
})

type LoginFormValues = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = (data: LoginFormValues) => {
    console.log("Logged in with:", data)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-ink text-stone flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Subtle background texture/pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #E9EBDF 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        
        <div className="relative z-10 text-center">
          <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tighter drop-shadow-stamp mb-6">
            Mandi Ledger
          </h1>
          <p className="font-sans text-xl text-stone/70 max-w-md mx-auto">
            Digitized grain inventory. Precision scaled for the modern godown.
          </p>
        </div>
        
        <div className="absolute bottom-8 left-8 right-8 flex justify-between text-xs font-mono text-stone/40">
          <span>v1.0.0</span>
          <span>SYSTEM READY</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-stone flex flex-col justify-center items-center p-8 lg:p-24 relative shadow-[-20px_0_40px_rgba(20,32,26,0.1)]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 text-center">
            <h1 className="font-display text-4xl uppercase tracking-tighter text-ink drop-shadow-stamp mb-2">
              Mandi Ledger
            </h1>
          </div>
          
          <h2 className="font-sans text-2xl font-semibold text-ink mb-8">Access Ledger</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium text-sm text-ink block">Clerk ID</label>
              <Input 
                type="text" 
                placeholder="Enter ID" 
                className="font-mono text-lg h-12"
                {...register("clerkId")}
              />
              {errors.clerkId && <p className="text-ledger-red text-sm font-medium">{errors.clerkId.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="font-medium text-sm text-ink block">Passcode</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="font-mono text-lg h-12 tracking-widest"
                {...register("passcode")}
              />
              {errors.passcode && <p className="text-ledger-red text-sm font-medium">{errors.passcode.message}</p>}
            </div>
            
            <Button type="submit" className="w-full h-12 text-lg uppercase tracking-wider font-display pt-1">
              Unlock Ledger
            </Button>
            
            <p className="text-center font-mono text-xs text-ink/50 mt-6">
              Secure admin access. All activities are logged.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
