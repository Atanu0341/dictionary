import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Search from "@/components/Search";
import AboutMe from "@/components/AboutMe";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold text-center text-primary">Dictionary App</h1>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="about">About Me</TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            <Search />
          </TabsContent>
          <TabsContent value="about">
            <AboutMe />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}