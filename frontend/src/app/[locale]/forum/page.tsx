"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, Clock, User } from "lucide-react";

type Topic = {
  id: number;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActive: string;
  content: string;
};

export default function ForumPage() {
  const [topics, setTopics] = useState<Topic[]>([
    { id: 1, title: "Best settings for dark denim analysis?", author: "jean_maker", replies: 12, views: 304, lastActive: "2 hours ago", content: "I've been trying to get an accurate warp count on very dark denim but the OCR and models struggle slightly. Any tips on lighting?" },
    { id: 2, title: "Feature Request: Export to Excel", author: "factory_manager", replies: 5, views: 120, lastActive: "1 day ago", content: "Would be amazing if we could select multiple reports and export them directly to an XLSX file rather than individual PDFs." },
    { id: 3, title: "Understanding Confidence Scores", author: "textile_student", replies: 8, views: 245, lastActive: "3 days ago", content: "Can someone explain the difference between a 95% and 99% confidence score on the thread density metric?" }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    const newTopic: Topic = {
      id: Date.now(),
      title: newTitle,
      author: "current_user",
      replies: 0,
      views: 1,
      lastActive: "Just now",
      content: newContent
    };

    setTopics([newTopic, ...topics]);
    setNewTitle("");
    setNewContent("");
    setIsPosting(false);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-2">Community Forum</h1>
          <p className="text-muted-foreground">Discuss techniques, request features, and connect with other ThreadCounty users.</p>
        </div>
        <Button onClick={() => setIsPosting(!isPosting)}>{isPosting ? "Cancel" : "New Topic"}</Button>
      </div>

      {isPosting && (
        <Card className="mb-8 border-primary/50 bg-primary/5 shadow-md">
          <CardHeader>
            <CardTitle>Create a New Topic</CardTitle>
            <CardDescription>Share your thoughts with the community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              placeholder="Topic Title" 
              value={newTitle} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)} 
            />
            <Textarea 
              placeholder="Write your message here..." 
              rows={5}
              value={newContent} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)} 
            />
            <div className="flex justify-end">
              <Button onClick={handlePost}>Post Topic</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {topics.map((topic) => (
          <Card key={topic.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{topic.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-1 mb-3">{topic.content}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {topic.author}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {topic.lastActive}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 md:border-l md:pl-6 text-center text-muted-foreground">
                <div>
                  <div className="text-lg font-bold text-foreground">{topic.replies}</div>
                  <div className="text-xs flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Replies</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{topic.views}</div>
                  <div className="text-xs flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> Views</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
