import { useState } from 'react'
import logo from "../../assets/solveline_logo-removebg-preview.png";

const SolvelineLogo = ({ compact = false, className = '' }) => {
  const [hasError, setHasError] = useState(false)

  if (compact) {
    return (
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-cyan-400 via-blue-500 to-amber-400 font-display text-lg font-bold text-white ${className}`}>
        S
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!hasError ? (
        <img
          src={logo}
          alt="Solveline"
          className="w-60 h-15"
          onError={() => setHasError(true)}
        />
      ) : (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-cyan-400 via-blue-500 to-amber-400 font-display text-xl font-bold text-white">
            S
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-sky-500">solveline</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">iletisim cozumleri</p>
          </div>
        </>
      )}
    </div>
  )
}

export default SolvelineLogo
