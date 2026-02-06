import { useStats } from "@/hooks/use-stats";
import { StatCard } from "@/components/StatCard";
import { CommandCard } from "@/components/CommandCard";
import { PlayingCard } from "@/components/PlayingCard";
import { Users, LayoutGrid, Gamepad2, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: stats, isLoading } = useStats();

  const handleAddToDiscord = () => {
    // This would normally be the OAuth URL for adding the bot
    window.open("https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=8", "_blank");
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[128px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary font-semibold text-sm backdrop-blur-sm">
                The unofficial Discord bot
              </span>
              <h1 className="mt-6 text-6xl md:text-7xl font-bold tracking-tight font-display leading-tight">
                Cards Against <br />
                <span className="text-gradient">Humanity</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-lg">
                The party game for horrible people, now available directly in your Discord server.
                Create games, play cards, and judge your friends.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button 
                onClick={handleAddToDiscord}
                size="lg" 
                className="h-14 px-8 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
              >
                <Bot className="mr-2 h-5 w-5" />
                Add to Discord
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 rounded-2xl text-lg font-semibold bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-white"
                onClick={() => document.getElementById('how-to-play')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How to Play
              </Button>
            </motion.div>
          </div>

          <div className="relative h-[600px] flex items-center justify-center perspective-1000 hidden lg:flex">
             <PlayingCard 
               type="white" 
               text="A Discord bot that judges your life choices."
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
               rotation={-6}
             />
             <PlayingCard 
               type="black" 
               text="What ended my last relationship?"
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 mt-12 ml-12"
               rotation={6}
             />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-black/20 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard 
              label="Active Games" 
              value={stats?.activeGames || 0} 
              icon={Gamepad2}
              delay={0.1}
            />
            <StatCard 
              label="Total Players" 
              value={stats?.totalPlayers || 0} 
              icon={Users}
              delay={0.2}
            />
            <StatCard 
              label="Cards in Deck" 
              value={stats?.totalCards || 0} 
              icon={LayoutGrid}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section id="how-to-play" className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">How to Play</h2>
          <p className="text-xl text-muted-foreground">Master the commands to dominate the game.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-4">
            <CommandCard 
              index={0}
              command="!join"
              description="Join the game lobby. Make sure you're ready to be offended."
            />
            <CommandCard 
              index={1}
              command="!start"
              description="Start the game once everyone has joined. Requires VIP status or 3+ players."
            />
            <CommandCard 
              index={2}
              command="!pick <number>"
              description="Play a white card from your hand. Pick the funniest one."
            />
            <CommandCard 
              index={3}
              command="!judge <number>"
              description="If you're the Card Czar, choose the winning card to award a point."
            />
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-pink-500/20 p-8 border border-white/10 backdrop-blur-sm">
               <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] rounded-3xl" />
               <div className="relative z-10 flex flex-col gap-4">
                 <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white">Bot</div>
                    <div className="bg-card p-4 rounded-2xl rounded-tl-none border border-white/10 max-w-[80%]">
                      <p className="font-semibold text-primary mb-1">Black Card</p>
                      <p className="text-lg">Why can't I sleep at night?</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-3 items-start flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">You</div>
                    <div className="bg-white text-black p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg">
                      <p className="font-bold mb-1 text-xs uppercase tracking-wide opacity-50">!pick 2</p>
                      <p className="font-semibold">A micro-penis.</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">CH</div>
            <span className="font-bold text-lg">Cards Against Humanity Bot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Not affiliated with Cards Against Humanity LLC.
          </p>
        </div>
      </footer>
    </div>
  );
}
