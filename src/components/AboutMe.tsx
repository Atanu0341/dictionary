import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AboutMe = () => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">About Me</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            Hello! I&apos;m Atanu Majumder, a passionate web developer with a keen interest
            in creating user-friendly and efficient web applications.
          </p>
          <p>
            I specialize in React and Next.js, and I love exploring new
            technologies to enhance my skills.
          </p>
          <p>
            When I&apos;m not coding, you can find me hiking in nature or reading a
            good book.
          </p>
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-2">Connect with me:</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="https://github.com/Atanu0341" 
                  className="text-blue-500 hover:underline"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link 
                  href="www.linkedin.com/in/atanumajumder0341" 
                  className="text-blue-500 hover:underline"
                >
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link 
                  href="https://x.com/Atanu10704224" 
                  className="text-blue-500 hover:underline"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link 
                  href="atanumajumder2004@gmail.com" 
                  className="text-blue-500 hover:underline"
                >
                  Email
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutMe;

