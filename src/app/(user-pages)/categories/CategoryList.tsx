'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';

import { Loader2, Pencil, SearchIcon, Trash2 } from 'lucide-react';
import type { Selection } from '@nextui-org/react';
import {
  Button,
  Chip,
  Input,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  useDisclosure,
} from '@nextui-org/react';

import type { Category, UserSettings } from '@prisma/client';
import { SortOrder } from '@prisma/client';

import type { CategoryFormTypes } from '@/validation';
import { cn, rowsPerPageArray } from '@/utils';
import { useConfirm, useFetchCategory } from '@/hooks';

import { CategoryModal } from './CategoryModal';
import { columns } from './const';

interface CategoryListProps {
  categoryData?: Category[];
  isCategoryDataLoading: boolean;
  userSettingsData?: UserSettings | null;
  isUserSettingsLoading: boolean;
  selectedKeysFn: (keys: any) => void;
  categoryListLengthFn: (length: number) => void;
}

interface SortDescriptor {
  column: (typeof columns)[number]['key'];
  direction: SortOrder;
}

export interface CategoryUpdate extends CategoryFormTypes {
  id: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categoryData,
  isCategoryDataLoading,
  userSettingsData,
  isUserSettingsLoading,
  selectedKeysFn,
  categoryListLengthFn,
}) => {
  const [category, setCategory] = useState<CategoryUpdate | null>(null);
  const [filterValue, setFilterValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: userSettingsData?.categorySortField || 'createdAt',
    direction: userSettingsData?.categorySortOrder || SortOrder.descending,
  });

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [categoryListLength, setCategoryListLength] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(userSettingsData?.categoryRowsPerPage || '5');

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { deleteCategory } = useFetchCategory();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Category',
    message: 'Are you sure you want to delete this category?',
  });

  useEffect(() => {
    categoryListLengthFn(categoryListLength);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryListLength]);

  const handleClick = async (id: string) => {
    const ok = await confirm();

    if (ok) {
      deleteCategory.mutateAsync(id);
    }
  };

  const updateClick = (category: CategoryUpdate) => {
    setCategory(category);
    onOpen();
  };

  const onSearchChange = useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);

  const onRowsPerPageChange = useCallback((e: { target: { value: React.SetStateAction<string> } }) => {
    setRowsPerPage(e.target.value);
    setPage(1);
  }, []);

  const onSelectedKeys = (keys: Selection) => {
    setSelectedKeys(keys);
    selectedKeysFn(keys === 'all' ? tableContent?.map(category => category.id) : Array.from(keys));
  };

  const tableContent = useMemo(() => {
    const start = (page - 1) * +rowsPerPage;
    const end = start + +rowsPerPage;

    const filteredData =
      categoryData?.filter(category => category.categoryName.toLowerCase().includes(filterValue.toLowerCase())) || [];

    const dataToUse = filterValue ? filteredData : categoryData || [];

    setPages(Math.ceil(dataToUse.length / +rowsPerPage));
    setCategoryListLength(dataToUse.length);

    return dataToUse
      .sort((a, b) => {
        const first = a[sortDescriptor.column as keyof typeof a];
        const second = b[sortDescriptor.column as keyof typeof b];
        const cmp = first !== null && second !== null ? (first < second ? -1 : first > second ? 1 : 0) : 0;

        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
      })
      .slice(start, end)
      .map(category => ({
        id: category.id,
        nameValue: category.categoryName,
        hiddenValue: category.hidden,
        name: (
          <p className="py-0.5 px-3 border-2 border-slate-300 rounded-full truncate md:text-clip text-ellipsis max-w-[160px] md:max-w-fit text-orange-500">
            {category.categoryName}
          </p>
        ),
        hidden: (
          <Chip color={category.hidden ? 'danger' : 'success'} variant="bordered">
            {category.hidden ? 'Hidden' : 'Visible'}
          </Chip>
        ),
        actions: (
          <div className="flex justify-center gap-4">
            <Button isIconOnly size="sm" variant="light">
              <Pencil className="cursor-pointer text-orange-300" onClick={() => updateClick(category)} />
            </Button>
            <Button isIconOnly size="sm" variant="light" disabled={deleteCategory.isPending}>
              {deleteCategory.isPending && category.id === deleteCategory.variables ? (
                <Loader2 className="text-slate-400 animate-spin" size={24} />
              ) : (
                <Trash2 className="cursor-pointer text-red-500" onClick={() => handleClick(category.id)} />
              )}
            </Button>
          </div>
        ),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryData, filterValue, rowsPerPage, sortDescriptor]);

  const TopContent = () => (
    <div className="flex gap-6 sm:items-center sm:justify-between mb-6 flex-col sm:flex-row">
      <Input
        isClearable
        autoFocus
        placeholder="Search category"
        className="max-w-[250px]"
        startContent={<SearchIcon />}
        value={filterValue}
        onClear={() => onClear()}
        onValueChange={onSearchChange}
      />
      <Select
        label="Select rows per page"
        labelPlacement="outside-left"
        className="max-w-[400px] sm:max-w-[200px] self-end"
        selectedKeys={[rowsPerPage]}
        onChange={onRowsPerPageChange}
        isLoading={isUserSettingsLoading}
      >
        {rowsPerPageArray.map(row => (
          <SelectItem key={row.key}>{row.label}</SelectItem>
        ))}
      </Select>
    </div>
  );

  const BottomContent = () => (
    <div className={cn('w-full justify-center', pages > 1 ? 'flex' : 'hidden')}>
      <Pagination
        isCompact
        showControls
        showShadow
        color="secondary"
        page={page}
        total={pages}
        onChange={page => setPage(page)}
      />
    </div>
  );

  return (
    <>
      {/* Desktop content */}
      <Table
        aria-label="Category table"
        topContent={<TopContent />}
        topContentPlacement="outside"
        bottomContent={<BottomContent />}
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectedKeys}
        sortDescriptor={sortDescriptor}
        onSortChange={descriptor => setSortDescriptor(descriptor as SortDescriptor)}
        classNames={{ wrapper: pages > 1 ? 'min-h-[370px]' : '' }}
        className="hidden sm:block"
      >
        <TableHeader columns={columns}>
          {column => (
            <TableColumn
              key={column.key}
              align={column.key === 'name' ? 'start' : 'center'}
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={tableContent || []}
          emptyContent={'No categories to display.'}
          isLoading={isCategoryDataLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {item => (
            <TableRow key={item.id}>{columnKey => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>

      {/* Mobile content */}
      {isCategoryDataLoading ? (
        <div className="flex justify-center bg-white shadow-md rounded-lg p-4 mb-4">
          <Spinner label="Loading..." />
        </div>
      ) : (
        <div className="sm:hidden">
          <TopContent />
          {tableContent?.length > 0 ? (
            tableContent?.map(category => (
              <div key={category.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">{category.name}</div>
                  <div className="flex gap-4">
                    <Pencil
                      size={24}
                      className="cursor-pointer text-orange-300"
                      onClick={() =>
                        updateClick({
                          categoryName: category.nameValue,
                          id: category.id,
                          hidden: category.hiddenValue,
                        })
                      }
                    />
                    <Trash2
                      size={24}
                      className={cn(
                        'cursor-pointer text-red-500',
                        deleteCategory.isPending && category.id === deleteCategory.variables ? 'opacity-50' : ''
                      )}
                      onClick={() => handleClick(category.id)}
                    />
                  </div>
                </div>
                <div className={cn('text-sm mt-2', category.hiddenValue ? 'text-red-500' : 'text-green-500')}>
                  {category.hiddenValue ? 'Hidden' : 'Visible'}
                </div>
              </div>
            ))
          ) : (
            <div className="sm:hidden bg-white shadow-md rounded-lg p-4 mb-4">
              <p className="text-center">No categories to display.</p>
            </div>
          )}
          <div className="sm:hidden mt-6">
            <BottomContent />
          </div>
        </div>
      )}

      {/* Modals */}
      <CategoryModal isOpen={isOpen} onOpenChange={onOpenChange} category={category} />
      <ConfirmModal />
    </>
  );
};
