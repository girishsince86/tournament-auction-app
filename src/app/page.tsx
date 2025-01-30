import { Button } from '@mui/material'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Tournament Auction App
        </h1>
        <p className="text-center mb-8">
          A platform for managing tournament player auctions
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="contained" color="primary" href="/login">
            Login
          </Button>
          <Button variant="outlined" color="primary" href="/register">
            Register
          </Button>
        </div>
      </div>
    </main>
  )
} 