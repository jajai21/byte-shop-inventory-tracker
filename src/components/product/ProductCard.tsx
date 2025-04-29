
import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/contexts/ProductContext";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { formatCurrency } from "@/lib/formatters";

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
}

const ProductCard = ({ product, onEdit }: ProductCardProps) => {
  const { deleteProduct } = useProducts();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="p-4 bg-byteshop-blue/5 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg line-clamp-1" title={product.name}>{product.name}</h3>
                <span className="text-xs bg-byteshop-purple/10 text-byteshop-purple px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
              </div>
              <span className="text-sm bg-gray-100 px-2 py-0.5 rounded font-mono">
                {product.code}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{product.quantity} {product.unit}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">{formatCurrency(product.price)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 bg-gray-50 border-t">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{product.name}" and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteProduct(product.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductCard;
