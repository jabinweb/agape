import { Metadata } from "next"
import BlogPostForm from "@/components/admin/BlogPostForm"

export const metadata: Metadata = {
  title: "New Blog Post",
  description: "Create a new blog post."
}

export default function NewBlogPostPage() {
  return <BlogPostForm />
}
