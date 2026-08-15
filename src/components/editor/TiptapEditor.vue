<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { Video as VideoExtension } from './extensions/Video'
import type { ArticleContent } from '@/types/content'
import { tiptapToBlocks } from '@/utils/content/tiptapToBlocks'
import { blocksToTiptap } from '@/utils/content/blocksToTiptap'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  ImagePlus,
  Video,
  Undo2,
  Redo2,
  Minus,
  Loader2,
} from 'lucide-vue-next'
import { uploadImage, uploadVideo } from '@/services/newsEditorService'

const props = defineProps<{
  modelValue: ArticleContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ArticleContent]
}>()

const isComposing = ref(false)
let updatingFromEditor = false

const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingImage = ref(false)

const videoFileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingVideo = ref(false)


// 编辑器内部是 ProseMirror 文档树，props.modelValue 是块级 JSON（ArticleContent）：
// 初始化时经 blocksToTiptap 转成文档树；文档树变化时 onUpdate 经 tiptapToBlocks 通知父组件；
// 父组件更新 modelValue 时，watch 再经 blocksToTiptap 解析回文档树。
const editor = useEditor({
  content: blocksToTiptap(props.modelValue),
  extensions: [
    StarterKit,
    Image,
    // 链接在编辑态不可点击跳转；样式交由 .news-prose 作用域控制
    Link.configure({
      openOnClick: false,
    }),
    Placeholder.configure({
      placeholder: '请输入新闻正文...',
    }),
    VideoExtension,
  ],
  editorProps: {
    // 编辑器的属性
    attributes: {
      class: 'news-prose focus:outline-none min-h-[300px] px-4 py-3',
    },
    // 中文输入过程只触发一次onUpdate
    handleDOMEvents: {
      // 组合事件开始
      compositionstart: () => {
        isComposing.value = true
      },
      // 组合事件结束
      compositionend: () => {
        isComposing.value = false
      },
    },
  },
  // onUpdate的作用是通知父元素更新props
  onUpdate: () => {
    if (isComposing.value) return
    updatingFromEditor = true
    emit('update:modelValue', tiptapToBlocks(editor.value?.getJSON()))
    nextTick(() => {
      updatingFromEditor = false
    })
  },
})

 // 这个watch的作用是监听props.modelValue的改变，块级JSON被解析回内部文档树
watch(
  () => props.modelValue,
  (val) => {
    if (updatingFromEditor) return
    if (editor.value) {
      editor.value.commands.setContent(blocksToTiptap(val), { emitUpdate: false })
    }
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const addImage = () => {
  fileInputRef.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploadingImage.value = true
  const response = await uploadImage(file)
  isUploadingImage.value = false

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  if (response.success && response.data) {
    editor.value?.chain().focus().setImage({ src: response.data.url }).run()
  }
}

const addLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('请输入链接地址', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const addVideo = () => {
  videoFileInputRef.value?.click()
}

const handleVideoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploadingVideo.value = true
  const response = await uploadVideo(file)
  isUploadingVideo.value = false

  if (videoFileInputRef.value) {
    videoFileInputRef.value.value = ''
  }

  if (response.success && response.data) {
    editor.value?.chain().focus().insertContent({
      type: 'video',
      attrs: { src: response.data.url },
    }).run()
  }
}
</script>

<template>
  <div class="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-brand focus-within:border-transparent">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
      <button
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('bold') ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="粗体"
      >
        <Bold :size="16" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('italic') ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="斜体"
      >
        <Italic :size="16" />
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1" />

      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="标题1"
      >
        <Heading1 :size="16" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="标题2"
      >
        <Heading2 :size="16" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="标题3"
      >
        <Heading3 :size="16" />
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1" />

      <button
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('bulletList') ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="无序列表"
      >
        <List :size="16" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('orderedList') ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="有序列表"
      >
        <ListOrdered :size="16" />
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1" />

      <button
        type="button"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('blockquote') ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="引用"
      >
        <Quote :size="16" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('codeBlock') ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="代码块"
      >
        <Code :size="16" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().setHorizontalRule().run()"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"
        title="分割线"
      >
        <Minus :size="16" />
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1" />

      <button
        type="button"
        @click="addLink"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('link') ? 'bg-gray-200 text-brand' : 'text-gray-600']"
        title="链接"
      >
        <LinkIcon :size="16" />
      </button>
      <button
        type="button"
        @click="addImage"
        :disabled="isUploadingImage"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
        title="插入图片"
      >
        <Loader2 v-if="isUploadingImage" :size="16" class="animate-spin" />
        <ImagePlus v-else :size="16" />
      </button>
      <button
        type="button"
        @click="addVideo"
        :disabled="isUploadingVideo"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
        title="插入视频"
      >
        <Loader2 v-if="isUploadingVideo" :size="16" class="animate-spin" />
        <Video v-else :size="16" />
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1" />

      <button
        type="button"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-30"
        title="撤销"
      >
        <Undo2 :size="16" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-30"
        title="重做"
      >
        <Redo2 :size="16" />
      </button>
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" />

    <input
      ref="fileInputRef"
      type="file"
      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
      class="hidden"
      @change="handleImageUpload"
    />
    <input
      ref="videoFileInputRef"
      type="file"
      accept="video/mp4,video/webm,video/ogg"
      class="hidden"
      @change="handleVideoUpload"
    />
  </div>
</template>

<style>
/* 编辑器结点的样式来源：
  1. tiptap默认样式
  2. tailwindcss样式覆盖
  3. 内联样式
  4. class
*/
</style>