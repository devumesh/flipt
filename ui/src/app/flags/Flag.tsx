import { CalendarIcon, FilesIcon, Trash2Icon } from 'lucide-react';
import 'chartjs-adapter-date-fns';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { selectReadonly } from '~/app/meta/metaSlice';
import {
  selectCurrentNamespace,
  selectNamespaces
} from '~/app/namespaces/namespacesSlice';
import FlagForm from '~/components/flags/forms/FlagForm';
import Dropdown from '~/components/forms/Dropdown';
import Loading from '~/components/Loading';
import Modal from '~/components/Modal';
import MoreInfo from '~/components/MoreInfo';
import CopyToNamespacePanel from '~/components/panels/CopyToNamespacePanel';
import DeletePanel from '~/components/panels/DeletePanel';
import { useError } from '~/data/hooks/error';
import { useSuccess } from '~/data/hooks/success';
import { useTimezone } from '~/data/hooks/timezone';
import {
  useCopyFlagMutation,
  useDeleteFlagMutation,
  useGetFlagQuery
} from './flagsApi';
import { FlagType } from '~/types/Flag';
import { cls } from '~/utils/helpers';
import { PageHeader } from '~/components/ui/page';

const variantFlagTabs = [
  { name: 'Variants', to: '' },
  { name: 'Rules', to: 'rules' },
  { name: 'Analytics', to: 'analytics' }
];

const booleanFlagTabs = [
  { name: 'Rollouts', to: '' },
  { name: 'Analytics', to: 'analytics' }
];

export default function Flag() {
  let { flagKey } = useParams();
  const { inTimezone } = useTimezone();

  const [showDeleteFlagModal, setShowDeleteFlagModal] = useState(false);
  const [showCopyFlagModal, setShowCopyFlagModal] = useState(false);

  const { setError, clearError } = useError();
  const { setSuccess } = useSuccess();

  const navigate = useNavigate();

  const namespaces = useSelector(selectNamespaces);
  const namespace = useSelector(selectCurrentNamespace);
  const readOnly = useSelector(selectReadonly);

  const {
    data: flag,
    error,
    isLoading,
    isError
  } = useGetFlagQuery({
    namespaceKey: namespace.key,
    flagKey: flagKey || ''
  });

  const [deleteFlag] = useDeleteFlagMutation();
  const [copyFlag] = useCopyFlagMutation();

  useEffect(() => {
    if (isError) {
      setError(error);
    }
  }, [error, isError, setError]);

  if (isLoading || !flag) {
    return <Loading />;
  }

  return (
    <>
      {/* flag delete modal */}
      <Modal open={showDeleteFlagModal} setOpen={setShowDeleteFlagModal}>
        <DeletePanel
          panelMessage={
            <>
              Are you sure you want to delete the flag{' '}
              <span className="font-medium text-violet-500">{flag.key}</span>?
              This action cannot be undone.
            </>
          }
          panelType="Flag"
          setOpen={setShowDeleteFlagModal}
          handleDelete={() =>
            deleteFlag({
              namespaceKey: namespace.key,
              flagKey: flag.key
            }).unwrap()
          }
          onSuccess={() => {
            navigate(`/namespaces/${namespace.key}/flags`);
          }}
        />
      </Modal>

      {/* flag copy modal */}
      <Modal open={showCopyFlagModal} setOpen={setShowCopyFlagModal}>
        <CopyToNamespacePanel
          panelMessage={
            <>
              Copy the flag{' '}
              <span className="font-medium text-violet-500">{flag.key}</span> to
              the namespace:
            </>
          }
          panelType="Flag"
          setOpen={setShowCopyFlagModal}
          handleCopy={(namespaceKey: string) =>
            copyFlag({
              from: { namespaceKey: namespace.key, flagKey: flag.key },
              to: { namespaceKey: namespaceKey, flagKey: flag.key }
            }).unwrap()
          }
          onSuccess={() => {
            clearError();
            setShowCopyFlagModal(false);
            setSuccess('Successfully copied flag');
          }}
        />
      </Modal>

      {/* flag header / actions */}
      <PageHeader title={flag.name}>
        <Dropdown
          label="Actions"
          actions={[
            {
              id: 'flag-copy',
              label: 'Copy to Namespace',
              disabled: readOnly || namespaces.length < 2,
              onClick: () => {
                setShowCopyFlagModal(true);
              },
              icon: FilesIcon
            },
            {
              id: 'flag-delete',
              label: 'Delete',
              disabled: readOnly,
              onClick: () => setShowDeleteFlagModal(true),
              icon: Trash2Icon,
              variant: 'destructive'
            }
          ]}
        />
      </PageHeader>
      <div className="flex items-center justify-between">
        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          <div
            title={inTimezone(flag.createdAt)}
            className="mt-2 flex items-center text-sm text-gray-500"
          >
            <CalendarIcon
              className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            Created{' '}
            {formatDistanceToNowStrict(parseISO(flag.createdAt), {
              addSuffix: true
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {/* flag details */}
        <div className="my-5">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <p className="mt-1 text-sm text-gray-500">
                Basic information about the flag and its status.
              </p>
              <MoreInfo
                className="mt-5"
                href="https://www.flipt.io/docs/concepts#flags"
              >
                Learn more about flags
              </MoreInfo>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <FlagForm flag={flag} />
            </div>
          </div>
        </div>
        <>
          <div className="mt-3 flex flex-row sm:mt-5">
            <div className="border-b-2 border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {flag.type === FlagType.VARIANT ? (
                  <>
                    {variantFlagTabs.map((tab) => (
                      <NavLink
                        end
                        key={tab.name}
                        to={tab.to}
                        className={({ isActive }) =>
                          cls(
                            'whitespace-nowrap border-b-2 px-1 py-2 font-medium',
                            {
                              'border-violet-500 text-violet-600': isActive,
                              'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-700':
                                !isActive
                            }
                          )
                        }
                      >
                        {tab.name}
                      </NavLink>
                    ))}
                  </>
                ) : (
                  <>
                    {booleanFlagTabs.map((tab) => (
                      <NavLink
                        end
                        key={tab.name}
                        to={tab.to}
                        className={({ isActive }) =>
                          cls(
                            'whitespace-nowrap border-b-2 px-1 py-2 font-medium',
                            {
                              'border-violet-500 text-violet-600': isActive,
                              'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-700':
                                !isActive
                            }
                          )
                        }
                      >
                        {tab.name}
                      </NavLink>
                    ))}
                  </>
                )}
              </nav>
            </div>
          </div>
          <Outlet context={{ flag }} />
        </>
      </div>
    </>
  );
}
