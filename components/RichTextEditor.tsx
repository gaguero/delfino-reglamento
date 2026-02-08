'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false }), // Disable default paragraph
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none [&_ul]:list-disc [&_ol]:list-roman [&_li]:task-list-item [&_li]:marker:text-green-500 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1 [&_p]:mb-2 [&_.tiptap]:focus:outline-none [&_.tiptap]:min-h-[180px]',
      },
    },
  })

  if (!editor) return null

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({ editor }: { editor: any }) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const activeLink = editor.isActive('link')

  useEffect(() => {
    if (activeLink && editor.getAttributes('link').href) {
      setLinkUrl(editor.getAttributes('link').href)
    } else {
      setLinkUrl('')
    }
  }, [activeLink, editor.getAttributes('link').href, editor])

  const handleSetLink = () => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: linkUrl }).run()
    setShowLinkInput(false)
  }

  const handleKeydown = (e: any) => {
    if (e.key === 'Enter') {
      handleSetLink()
    } else if (e.key === 'Escape') {
      editor.chain().focus().unsetLink().run()
      setShowLinkInput(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
      <ToolbarBtn
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="B"
        title="Negrita"
        bold
      />
      <ToolbarBtn
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="I"
        title="Cursiva"
        italic
      />
      <span className="w-px bg-gray-300 mx-1" />
      <ToolbarBtn
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        label="H3"
        title="Título H3"
      />
      <ToolbarBtn
        active={editor.isActive('heading', { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        label="H4"
        title="Título H4"
      />
      <span className="w-px bg-gray-300 mx-1" />
      <ToolbarBtn
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="• Lista"
        title="Lista con viñetas"
      />
      <ToolbarBtn
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="1. Lista"
        title="Lista numerada"
      />
      <span className="w-px bg-gray-300 mx-1" />
      <ToolbarBtn
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="❝ Cita"
        title="Bloque de cita"
      />

      {!activeLink && (
        <button
          type="button"
          onClick={() => {
            setLinkUrl('')
            setShowLinkInput(true)
          }}
          className={cn(`px-2 py-1 text-xs rounded`, showLinkInput && 'bg-blue-600 text-white')}
          title="Insertar enlace"
        >
          🔗 Link
        </button>
      )}
      {showLinkInput && (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleKeydown}
            placeholder="https://ejemplo.com"
            className="text-xs rounded px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button onClick={handleSetLink} className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
            OK
          </button>
          <button onClick={() => { setShowLinkInput(false); editor.chain().focus().unsetLink().run() }} className="px-2 py-1 text-xs rounded bg-white text-red-600 hover:bg-red-50">
            ✕
          </button>
        </div>
      )}
      {activeLink && !showLinkInput && (
        <>
          <button
            type="button"
            onClick={() => setShowLinkInput(true)}
            className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
            title="Editar enlace"
          >
            🔗 Link ({linkUrl.substring(0, 20)}{linkUrl.length > 20 ? '...' : ''})
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetLink().run()
              setShowLinkInput(false)
            }}
            className="px-2 py-1 text-xs rounded bg-white text-red-600 hover:bg-red-50"
            title="Quitar enlace"
          >
            ✕ Link
          </button>
        </>
      )}
    </div>
  )
}

function ToolbarBtn({
  active,
  onClick,
  label,
  title,
  bold,
  italic,
}: {
  active: boolean
  onClick: () => void
  label: string
  title: string
  bold?: boolean
  italic?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        `px-2 py-1 text-xs rounded`,
        active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
      )}
      title={title}
    >
      <span className={cn({ 'font-bold': bold, 'italic': italic })}>{label}</span>
    </button>
  )
}
