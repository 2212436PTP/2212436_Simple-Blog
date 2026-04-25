"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Ban co chac muon xoa bai viet "${postTitle}"? Hanh dong nay khong the hoan tac.`,
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      alert("Co loi xay ra khi xoa bai viet");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-500 px-3 py-1 text-sm disabled:opacity-50"
    >
      {loading ? "Dang xoa..." : "Xoa"}
    </button>
  );
}
