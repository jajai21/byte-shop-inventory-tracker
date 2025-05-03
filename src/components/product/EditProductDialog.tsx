
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/contexts/ProductContext";
import { Product, PriceHistory } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

const categoryOptions = [
  "Processor",
  "Motherboard",
  "Graphics Card",
  "Memory",
  "Storage",
  "Power Supply",
  "Case",
  "Cooling",
  "Monitor",
  "Peripheral"
];

const EditProductDialog = ({ open, onOpenChange, product }: EditProductDialogProps) => {
  const { updateProduct, getProductPriceHistory } = useProducts();
  const [formData, setFormData] = useState({ ...product });
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [activeTab, setActiveTab] = useState("edit");

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setPriceHistory(getProductPriceHistory(product.id));
    }
  }, [product, getProductPriceHistory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" || name === "price" 
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduct(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="edit">Product Details</TabsTrigger>
            <TabsTrigger value="history">Price History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Product Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    readOnly
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pc">PC</SelectItem>
                        <SelectItem value="kit">Kit</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-byteshop-purple hover:bg-byteshop-purple/90">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="border rounded-md">
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 font-medium text-sm border-b">
                <div>Date</div>
                <div>Price</div>
                <div>Change</div>
              </div>
              
              {priceHistory.length > 0 ? (
                <div className="divide-y max-h-[300px] overflow-y-auto">
                  {priceHistory.map((entry, index) => {
                    const prevPrice = index > 0 ? priceHistory[index - 1].price : null;
                    const priceDiff = prevPrice !== null ? entry.price - prevPrice : 0;
                    const percentChange = prevPrice ? ((priceDiff / prevPrice) * 100).toFixed(2) : "0";
                    
                    return (
                      <div key={entry.id} className="grid grid-cols-3 gap-4 p-3 text-sm">
                        <div>{formatDate(entry.date)}</div>
                        <div>{formatCurrency(entry.price)}</div>
                        <div>
                          {index === 0 ? (
                            "Initial price"
                          ) : (
                            <span className={priceDiff > 0 ? "text-green-600" : priceDiff < 0 ? "text-red-600" : "text-gray-600"}>
                              {priceDiff > 0 ? "+" : ""}{formatCurrency(priceDiff)} ({priceDiff > 0 ? "+" : ""}{percentChange}%)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="p-4 text-center text-gray-500">No price history available.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
