import { createPost } from "../../actions";
import { PostForm } from "../../_components/post-form";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <div className="mt-6">
        <PostForm action={createPost} submitLabel="Create post" />
      </div>
    </div>
  );
}
