import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, User } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "The Future of Textile AI in 2026",
      excerpt: "How computer vision is eliminating manual thread counting globally.",
      date: "Jun 24, 2026",
      author: "Dr. Alan Turing",
      category: "Research",
    },
    {
      id: 2,
      title: "Optimizing the Warp and Weft",
      excerpt: "Understanding how thread density affects overall fabric durability.",
      date: "Jun 18, 2026",
      author: "Grace Hopper",
      category: "Engineering",
    },
    {
      id: 3,
      title: "ThreadCounty v2.0 Release Notes",
      excerpt: "We've added OCR, Voice Search, and a Community Forum in our latest massive update.",
      date: "Jun 10, 2026",
      author: "Product Team",
      category: "Announcements",
    }
  ];

  return (
    <div className="container mx-auto py-20 px-4 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">ThreadCounty Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Insights, research, and news from the frontier of textile manufacturing AI.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer group">
            <div className="h-48 bg-muted w-full border-b flex items-center justify-center overflow-hidden">
              <div className="text-muted-foreground/30 font-bold text-4xl group-hover:scale-110 transition-transform">
                {post.category}
              </div>
            </div>
            <CardHeader className="flex-1">
              <div className="flex items-center text-xs text-muted-foreground mb-2 gap-4">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
              </div>
              <CardTitle className="leading-snug">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>
              <Link href={`/blog/${post.id}`} className="text-primary text-sm font-bold flex items-center gap-1 group-hover:underline">
                Read Article <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
