import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Heading,
  Image,
  List,
  Quote,
  Code,
  Video,
  Minus,
  AlignLeft,
  AlignCenter,
  Bold,
  Italic,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'list' | 'quote' | 'code' | 'video' | 'divider';
  content: string;
  metadata?: {
    level?: number; // for headings (1-6)
    listType?: 'ordered' | 'unordered'; // for lists
    alignment?: 'left' | 'center' | 'right'; // for images and text
    alt?: string; // for images
    caption?: string; // for images/videos
  };
}

interface BlockEditorProps {
  initialContent?: string;
  onChange: (htmlContent: string) => void;
  uploadedImages?: string[];
}

export function BlockEditor({ initialContent = '', onChange, uploadedImages = [] }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    // Initialize with a single paragraph block if no content
    if (!initialContent) {
      return [{
        id: generateId(),
        type: 'paragraph',
        content: '',
      }];
    }
    
    // For now, convert existing HTML content to a single paragraph
    // In a real implementation, you'd parse HTML into blocks
    return [{
      id: generateId(),
      type: 'paragraph',
      content: initialContent.replace(/<[^>]*>/g, ''), // Strip HTML for now
    }];
  });

  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);

  function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  const addBlock = (type: ContentBlock['type'], afterId?: string) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: '',
      metadata: type === 'heading' ? { level: 2 } : type === 'list' ? { listType: 'unordered' } : {},
    };

    setBlocks(prev => {
      if (!afterId) {
        return [...prev, newBlock];
      }
      
      const index = prev.findIndex(block => block.id === afterId);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });
    
    setShowBlockMenu(null);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newBlocks = [...prev];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      return newBlocks;
    });
  };

  // Convert blocks to HTML
  React.useEffect(() => {
    const html = blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.content}</p>`;
        case 'heading':
          const level = block.metadata?.level || 2;
          return `<h${level}>${block.content}</h${level}>`;
        case 'image':
          const alt = block.metadata?.alt || '';
          const caption = block.metadata?.caption || '';
          return `<figure><img src="${block.content}" alt="${alt}" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
        case 'list':
          const listType = block.metadata?.listType === 'ordered' ? 'ol' : 'ul';
          const items = block.content.split('\n').filter(item => item.trim()).map(item => `<li>${item.trim()}</li>`).join('');
          return `<${listType}>${items}</${listType}>`;
        case 'quote':
          return `<blockquote>${block.content}</blockquote>`;
        case 'code':
          return `<pre><code>${block.content}</code></pre>`;
        case 'video':
          return `<video controls><source src="${block.content}" type="video/mp4" /></video>`;
        case 'divider':
          return '<hr />';
        default:
          return `<p>${block.content}</p>`;
      }
    }).join('\n');
    
    onChange(html);
  }, [blocks, onChange]);

  const renderBlock = (block: ContentBlock, index: number) => {
    const isFirst = index === 0;
    const isLast = index === blocks.length - 1;

    return (
      <div key={block.id} className="group relative border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
        {/* Block Controls */}
        <div className="absolute -left-12 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => moveBlock(block.id, 'up')}
            disabled={isFirst}
            className="h-6 w-6 p-0"
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => moveBlock(block.id, 'down')}
            disabled={isLast}
            className="h-6 w-6 p-0"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deleteBlock(block.id)}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Block Content */}
        <div className="space-y-2">
          {renderBlockContent(block)}
        </div>

        {/* Add Block Button */}
        <div className="mt-4 flex justify-center">
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowBlockMenu(showBlockMenu === block.id ? null : block.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Block
            </Button>

            {showBlockMenu === block.id && (
              <div
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 grid grid-cols-4 gap-2 w-64"
                onClick={(e) => e.stopPropagation()}
              >
                <BlockMenuItem icon={Type} label="Paragraph" onClick={() => addBlock('paragraph', block.id)} />
                <BlockMenuItem icon={Heading} label="Heading" onClick={() => addBlock('heading', block.id)} />
                <BlockMenuItem icon={Image} label="Image" onClick={() => addBlock('image', block.id)} />
                <BlockMenuItem icon={List} label="List" onClick={() => addBlock('list', block.id)} />
                <BlockMenuItem icon={Quote} label="Quote" onClick={() => addBlock('quote', block.id)} />
                <BlockMenuItem icon={Code} label="Code" onClick={() => addBlock('code', block.id)} />
                <BlockMenuItem icon={Video} label="Video" onClick={() => addBlock('video', block.id)} />
                <BlockMenuItem icon={Minus} label="Divider" onClick={() => addBlock('divider', block.id)} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBlockContent = (block: ContentBlock) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <Textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Write your paragraph..."
            rows={3}
            className="resize-none border-none p-0 text-base"
          />
        );

      case 'heading':
        return (
          <div className="space-y-2">
            <Select
              value={block.metadata?.level?.toString() || '2'}
              onValueChange={(value) => updateBlock(block.id, {
                metadata: { ...block.metadata, level: parseInt(value) }
              })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
                <SelectItem value="5">H5</SelectItem>
                <SelectItem value="6">H6</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Heading text..."
              className={`border-none p-0 font-bold ${
                block.metadata?.level === 1 ? 'text-3xl' :
                block.metadata?.level === 2 ? 'text-2xl' :
                block.metadata?.level === 3 ? 'text-xl' :
                block.metadata?.level === 4 ? 'text-lg' :
                'text-base'
              }`}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <Select
              value={block.content || ''}
              onValueChange={(value) => updateBlock(block.id, { content: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an uploaded image..." />
              </SelectTrigger>
              <SelectContent>
                {uploadedImages.map((imageUrl, index) => (
                  <SelectItem key={index} value={imageUrl}>
                    Image {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {!block.content && (
              <Input
                placeholder="Or enter image URL..."
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              />
            )}
            
            {block.content && (
              <div className="space-y-2">
                <img src={block.content} alt="" className="max-w-full h-auto rounded" />
                <Input
                  value={block.metadata?.alt || ''}
                  onChange={(e) => updateBlock(block.id, {
                    metadata: { ...block.metadata, alt: e.target.value }
                  })}
                  placeholder="Alt text..."
                />
                <Input
                  value={block.metadata?.caption || ''}
                  onChange={(e) => updateBlock(block.id, {
                    metadata: { ...block.metadata, caption: e.target.value }
                  })}
                  placeholder="Caption (optional)..."
                />
              </div>
            )}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            <Select
              value={block.metadata?.listType || 'unordered'}
              onValueChange={(value: 'ordered' | 'unordered') => updateBlock(block.id, {
                metadata: { ...block.metadata, listType: value }
              })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unordered">Bullet List</SelectItem>
                <SelectItem value="ordered">Numbered List</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter list items (one per line)..."
              rows={4}
            />
          </div>
        );

      case 'quote':
        return (
          <Textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Enter your quote..."
            rows={3}
            className="border-l-4 border-gray-300 pl-4 italic text-lg"
          />
        );

      case 'code':
        return (
          <Textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Enter your code..."
            rows={6}
            className="font-mono text-sm bg-gray-100"
          />
        );

      case 'video':
        return (
          <div className="space-y-2">
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter video URL..."
            />
            {block.content && (
              <video controls className="max-w-full">
                <source src={block.content} type="video/mp4" />
              </video>
            )}
          </div>
        );

      case 'divider':
        return (
          <div className="py-4">
            <hr className="border-gray-300" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 relative pl-12">
      {blocks.map((block, index) => renderBlock(block, index))}
      
      {/* Click outside to close menu */}
      {showBlockMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowBlockMenu(null)}
        />
      )}
    </div>
  );
}

interface BlockMenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

function BlockMenuItem({ icon: Icon, label, onClick }: BlockMenuItemProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="flex flex-col items-center p-2 rounded hover:bg-gray-100 transition-colors"
    >
      <Icon className="h-4 w-4 mb-1" />
      <span className="text-xs">{label}</span>
    </button>
  );
}
