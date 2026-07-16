import { X } from 'lucide-react';

interface ModalProps {
 open: boolean;
 onClose: () => void;
 title: string;
 children: React.ReactNode;
 wide?: boolean;
}

export default function Modal({ open, onClose, title, children, wide }: ModalProps) {
 if (!open) return null;
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
 <div
 className={`bg-white rounded-lg shadow-xl max-h-[85vh] overflow-y-auto ${wide ? 'w-[800px]' : 'w-[520px]'} max-w-full mx-4`}
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex items-center justify-between p-4 border-b ">
 <h2 className="text-lg font-semibold ">{title}</h2>
 <button onClick={onClose} className="p-1 hover:bg-gray-100 :bg-gray-700 rounded"><X size={18} className="" /></button>
 </div>
 <div className="p-4 ">{children}</div>
 </div>
 </div>
 );
}
