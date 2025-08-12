import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function AssetTypeSwitch({ onChange }) {
  // true = Real Money + CFD, false = Paper Money + Paper CFD
  const [isRealMoney, setIsRealMoney] = useState(true)

  const handleSwitch = (checked) => {
    setIsRealMoney(checked)
    const selectedTypes = checked
      ? ["Real Money", "CFD"]
      : ["Paper Money", "Paper CFD"]
    onChange(selectedTypes)
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="asset-type-switch"
        checked={isRealMoney}
        onCheckedChange={handleSwitch}
        className="data-[state=checked]:bg-blue-500 transition-colors duration-200 ease-in-out data-[state=unchecked]:bg-gray-400"
      />
      <Label htmlFor="asset-type-switch">
        {isRealMoney ? "Real Money" : "Paper Money"}
      </Label>
    </div>
  )
}