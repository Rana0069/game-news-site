import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import PostEditor from '@/components/admin/PostEditor'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { tags: true },
  })

  if (!post) notFound()

  return <PostEditor postId={post.id} initialData={post} />
}
