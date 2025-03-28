import {
  HomeIcon,
  TicketIcon,
  ShoppingCartIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/suporte/dashboard', icon: HomeIcon },
  { name: 'Tickets', href: '/suporte/tickets', icon: TicketIcon },
  { name: 'Pedidos', href: '/suporte/pedidos', icon: ShoppingCartIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface SuporteMenuProps {
  onLogout: () => void;
}

export default function SuporteMenu({ onLogout }: SuporteMenuProps) {
  const pathname = usePathname();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <Image
          src="/images/viralizamos-color.png"
          alt="Logo"
          width={150}
          height={40}
          className="h-8 w-auto"
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? 'bg-gray-50 text-indigo-600'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        pathname === item.href
                          ? 'text-indigo-600'
                          : 'text-gray-400 group-hover:text-indigo-600',
                        'h-6 w-6 shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <button
              onClick={onLogout}
              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 w-full"
            >
              <ArrowLeftOnRectangleIcon
                className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                aria-hidden="true"
              />
              Sair
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
