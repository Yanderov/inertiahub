local _i1III1l11 do local c=string.char local b=string.byte _i1III1l11=function(s,k) local o={} for i=1,#s do o[i]=c(((b(s,i)-((k+i*7)%251))%256)) end return table.concat(o) end end
local CoreGui = game:GetService(_i1III1l11("\1\52\62\56\33\86\81",183))
local Players = game:GetService(_i1III1l11("\27\62\58\89\76\96\104",196))
local TweenService = game:GetService(_i1III1l11("\44\86\75\82\98\83\108\128\139\133\134\143",209))
local UserInputService = game:GetService(_i1III1l11("\58\95\88\108\79\123\132\144\150\124\149\169\180\174\175\184",222))
local Workspace = game:GetService(_i1III1l11("\73\104\119\119\134\138\130\139\148",235))

local LocalPlayer = Players.LocalPlayer

local function destroyOld(parent)
	if not parent then return end
	local old = parent:FindFirstChild(_i1III1l11("\75\108\127\126\108\150\143\153\161\181\159\154",248))
	if old then old:Destroy() end
end
destroyOld(CoreGui)
if LocalPlayer then destroyOld(LocalPlayer:FindFirstChildOfClass(_i1III1l11("\97\132\128\159\146\166\130\183\178",10))) end

local parentGui = CoreGui
pcall(function() if gethui then parentGui = gethui() end end)
if not parentGui then parentGui = LocalPlayer:WaitForChild(_i1III1l11("\110\145\141\172\159\179\143\196\191",23)) end
destroyOld(parentGui)

local TELEMETRY_BASE = _i1III1l11("\147\166\173\176\186\136\132\139\204\216\214\234\243\239\238\252\16\4\215\40\48\56",36)
local executorName = _i1III1l11("\141\173\177\187\195\210\208",49)
pcall(function()
    if identifyexecutor then executorName = tostring(identifyexecutor())
    elseif syn then executorName = _i1III1l11("\152\197\193\187\209\219\212",62) end
end)

local function reportTelemetry(gameName)
    task.spawn(function()
        pcall(function()
            local req = (syn and syn.request) or http_request or request or (http and http.request)
            if not (req and LocalPlayer) then return end
            req({
                Url = TELEMETRY_BASE .. _i1III1l11("\129\186\208\208\157\235\173\178\254\246\4\4\19\18\40\45\59\248\64\64\76\76",75),
                Method = _i1III1l11("\175\181\192\200",88),
                Headers = { [_i1III1l11("\175\226\232\245\237\253\10\202\248\36\34\30",101)] = _i1III1l11("\218\240\247\250\254\255\4\30\26\39\45\245\55\71\74\80",114) },
                Body = game:GetService(_i1III1l11("\206\1\8\11\245\14\34\45\39\40\49",127)):JSONEncode({
                    userId = tostring(LocalPlayer.UserId),
                    game = gameName,
                    executor = executorName,
                    placeId = tostring(game.PlaceId),
                    timestamp = os.time(),
                }),
            })
        end)
    end)
end

local T = {
	BG = Color3.fromRGB(6, 6, 7),
	Card = Color3.fromRGB(13, 13, 15),
	Elev = Color3.fromRGB(21, 21, 24),
	Hover = Color3.fromRGB(30, 30, 34),
	Border = Color3.fromRGB(42, 42, 47),
	White = Color3.fromRGB(255, 255, 255),
	Text = Color3.fromRGB(238, 238, 240),
	Dim = Color3.fromRGB(128, 128, 136),
	Faint = Color3.fromRGB(84, 84, 92),
	Good = Color3.fromRGB(126, 214, 156),
	Bad = Color3.fromRGB(228, 100, 100),
}

local function gameIcon(id)
	return _i1III1l11("\5\252\25\28\23\43\42\38\5\1\8\84\96\94\90\62\79\112\131\130\109\142\161\167\102\176\178\146",140) .. tostring(id) .. _i1III1l11("\198\30\235\230\241\243\240\57\21\16\27\29",153)
end

local function corner(object, radius)
	local value = Instance.new(_i1III1l11("\2\253\254\49\59\62\60\80",166))
	value.CornerRadius = UDim.new(0, radius or 10)
	value.Parent = object
	return value
end
local function stroke(object, transparency, color)
	local value = Instance.new(_i1III1l11("\15\10\27\67\72\76\79\80",179))
	value.Color = color or T.Border
	value.Thickness = 1
	value.Transparency = transparency or 0.45
	value.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
	value.Parent = object
	return value
end
local function text(parent, value, size, color, font)
	local label = Instance.new(_i1III1l11("\27\51\77\80\47\75\83\93\112",192))
	label.Parent = parent
	label.BackgroundTransparency = 1
	label.Text = value or ""
	label.TextSize = size or 13
	label.TextColor3 = color or T.Text
	label.Font = font or Enum.Font.Gotham
	label.TextXAlignment = Enum.TextXAlignment.Left
	return label
end
local function tween(object, time, props, style, dir)
	return TweenService:Create(object, TweenInfo.new(time, style or Enum.EasingStyle.Quad, dir or Enum.EasingDirection.Out), props)
end
local function grad(object, topColor, bottomColor, rotation)
	local value = Instance.new(_i1III1l11("\41\36\41\91\81\91\108\111\127\140",205))
	value.Color = ColorSequence.new(topColor, bottomColor)
	value.Rotation = rotation or 90
	value.Parent = object
	return value
end

local MOBILE = UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled
local REPO = _i1III1l11("\73\92\99\102\117\67\63\70\144\134\163\97\161\170\188\183\203\191\217\222\215\235\227\246\252\9\1\17\30\223\27\46\51\252\45\60\80\77\85\105\114\128\64\132\136\136\92\166\160\168\188\127\191\195\198\208\230\169\238\233\248\4\204",218)

local Games = {
	{ name = _i1III1l11("\59\106\115\108\116\136\61\113\164\165\173\165\185\199\117\142",231), desc = _i1III1l11("\73\117\124\132\127\136\152\165\100\95\153\181\185\205\203\207\214\163\158\210\1\5\254\6\26\20\40",244), icon = 66654135, file = _i1III1l11("\122\129\77\81\150\157\105",6) },

	{ name = _i1III1l11("\94\134\149\158\164\172\176\186\185\210",19), desc = _i1III1l11("\106\157\98\171\179\106\184\192\206\217\225\148\227\247\247\4\0\12\12",32), icon = 6170143659, file = _i1III1l11("\152\160\175\184\190\198\202\212\211\236\169\229\237\252\5\11\19\23\33\32\57",45) },
	{ name = _i1III1l11("\145\186\180\201\208\217\221\215",58), desc = _i1III1l11("\150\182\192\196\214\145\186\235\231\240\255\14\11\29\21\227\222\41\49\56\74\14\91\84\87\34\113\127\137\144\148\158",71), icon = 4367208330, file = _i1III1l11("\203\212\206\227\234\243\247\241\194\10\19\13\34\41\50\54\48",84) },
}

local ScreenGui = Instance.new(_i1III1l11("\187\210\232\226\233\249\217\14\9",97))
ScreenGui.Name = _i1III1l11("\188\221\240\239\221\7\0\10\18\38\16\11",110)
ScreenGui.ResetOnSpawn = false
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
ScreenGui.DisplayOrder = 2147483646
pcall(function() ScreenGui.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets end)
ScreenGui.Parent = parentGui

local Main = Instance.new(_i1III1l11("\200\251\241\4\3",123))
Main.Name = _i1III1l11("\220\247\6\18",136)
Main.Parent = ScreenGui
Main.AnchorPoint = Vector2.new(0.5, 0.5)
Main.Position = UDim2.fromScale(0.5, 0.52)
Main.BackgroundColor3 = T.BG
Main.BorderSizePixel = 0
Main.Active = true
Main.ClipsDescendants = true
corner(Main, 16)
stroke(Main, 0.3)
grad(Main, Color3.fromRGB(11, 11, 13), Color3.fromRGB(4, 4, 5))

local Scale = Instance.new(_i1III1l11("\241\236\253\20\25\43\43",149))
Scale.Scale = 0.92
Scale.Parent = Main

local Header = Instance.new(_i1III1l11("\239\34\24\43\42",162))
Header.Name = _i1III1l11("\254\34\37\47\55\75",175)
Header.Parent = Main
Header.BackgroundTransparency = 1
Header.Active = true

local Brand = text(Header, _i1III1l11("\12\24\22\42\51\47\46",188), 18, T.White, Enum.Font.GothamBold)
local BrandSub = text(Header, _i1III1l11("\67\58\80\78\92\103\26\114\110\137\137\133\145\149\169",201), 11, T.Faint)

local Close = Instance.new(_i1III1l11("\49\73\99\102\59\122\128\135\137\143",214))
Close.Parent = Header
Close.AnchorPoint = Vector2.new(1, 0.5)
Close.BackgroundColor3 = T.Elev
Close.BorderSizePixel = 0
Close.AutoButtonColor = false
Close.Text = _i1III1l11("\173\136",227)
Close.TextColor3 = T.Dim
Close.Font = Enum.Font.GothamMedium
corner(Close, 9)
local closeStroke = stroke(Close, 0.5)

local Switch = Instance.new(_i1III1l11("\61\117\107\126\125",240))
Switch.Parent = Header
Switch.AnchorPoint = Vector2.new(1, 0.5)
Switch.BackgroundColor3 = T.Elev
Switch.BorderSizePixel = 0
corner(Switch, 10)
stroke(Switch, 0.55)

local SwitchPill = Instance.new(_i1III1l11("\79\130\120\139\138",2))
SwitchPill.Parent = Switch
SwitchPill.BackgroundColor3 = T.Hover
SwitchPill.BorderSizePixel = 0
SwitchPill.Size = UDim2.new(0.5, -4, 1, -6)
SwitchPill.Position = UDim2.new(0, 2, 0, 3)
corner(SwitchPill, 8)
stroke(SwitchPill, 0.6)

local function mkSwitchOption(label, isRight)
	local button = Instance.new(_i1III1l11("\106\130\156\159\116\174\180\187\189\195",15))
	button.Parent = Switch
	button.Size = UDim2.new(0.5, 0, 1, 0)
	button.Position = isRight and UDim2.new(0.5, 0, 0, 0) or UDim2.new(0, 0, 0, 0)
	button.BackgroundTransparency = 1
	button.AutoButtonColor = false
	button.Font = Enum.Font.GothamMedium
	button.Text = label
	button.ZIndex = 2
	return button
end
local PcOption = mkSwitchOption(_i1III1l11("\115\109",28), false)
local MobileOption = mkSwitchOption(_i1III1l11("\125\134\128\142\152\152",41), true)

local List = Instance.new(_i1III1l11("\144\167\189\193\197\204\208\220\220\194\245\235\254\253",54))
List.Name = _i1III1l11("\145\178\197\196\217",67)
List.Parent = Main
List.BackgroundTransparency = 1
List.BorderSizePixel = 0
List.CanvasSize = UDim2.new()
List.ScrollBarThickness = 0
List.ScrollingEnabled = false

local Layout = Instance.new(_i1III1l11("\172\167\177\213\230\238\205\233\8\5\18\24",80))
Layout.Parent = List
Layout.SortOrder = Enum.SortOrder.LayoutOrder

local Cards = {}
local busy = false
local setLoading

local function launch(entry)
	if busy then return end
	busy = true
	setLoading(entry, _i1III1l11("\200\218\233\231\236\246\239\249\5\17\17",93))
	task.defer(function()

		_G.INERTIA_MOBILE = MOBILE

		reportTelemetry(entry.name)

		local sha = _i1III1l11("\222\217\232\244",106)
		local okApi, apiRes = pcall(function() return game:HttpGet(_i1III1l11("\230\249\0\3\13\219\215\222\23\45\45\249\57\66\84\79\99\87\47\107\126\131\76\150\144\162\168\179\118\167\182\202\199\207\227\231\245\181\249\253\253\209\12\31\36\43\46\64\70\9\78\73\88\100",119)) end)
		if okApi and type(apiRes) == _i1III1l11("\254\6\11\9\21\21",132) then
			local extracted = apiRes:match(_i1III1l11("\186\18\14\14\214\224\53\243\10\252\81\15\14\27\85\100\47\113\70\75\75",145))
			if extracted then sha = extracted end
		end

		local payloadPath = entry.file .. (MOBILE and _i1III1l11("\4\25\34\28\42\52\52",158) or "")
		local url = _i1III1l11("\26\45\52\55\65\15\11\18\92\82\111\50\114\123\141\136\156\144\170\175\168\188\180\199\205\218\210\226\239\176\236\255\4\205\254\13\33\30\38\58\62\76\12\80\84\84\40",171) .. sha .. _i1III1l11("\238",184) .. payloadPath .. _i1III1l11("\250\63\79\66",197)
		local ok, source = pcall(function() return game:HttpGet(url) end)
		if not ok or type(source) ~= _i1III1l11("\76\84\89\87\99\104",210) or #source == 0 then
			url = _i1III1l11("\78\97\104\112\122\72\68\75\149\139\168\102\166\175\193\188\208\196\222\227\220\240\232\251\1\14\6\22\35\228\32\51\56\1\50\65\85\82\90\115\119\133\69\137\141\141\97",223) .. sha .. _i1III1l11("\34",236) .. payloadPath .. _i1III1l11("\51\128\139\142",249)
			ok, source = pcall(function() return game:HttpGet(url) end)
		end
		if not ok or type(source) ~= _i1III1l11("\133\141\146\144\156\156",11) or #source == 0 then
			busy = false
			setLoading(entry, _i1III1l11("\131\149\164\162\167\177\170\180\119\196\198\213\223\223\229",24), true)
			warn(_i1III1l11("\117\129\127\147\156\152\151\125\208\204\231\231\227\239\243\7\214\195",37) .. tostring(source))
			return
		end
		setLoading(entry, _i1III1l11("\172\180\168\192\201\197\209\209",50))

		local chunk, compileError = loadstring(source)
		if type(chunk) ~= _i1III1l11("\172\194\194\190\214\210\223\229",63) then
			busy = false
			setLoading(entry, _i1III1l11("\182\201\206\216\216\226\226\164\241\243\2\12\12\18",76), true)
			warn(_i1III1l11("\169\181\179\199\208\204\203\177\4\0\27\27\23\35\39\59\10\247",89) .. entry.file .. _i1III1l11("\141\216\228\230\169\254\6\18\197\15\34\39\49\49\59\59\23\4",102) .. tostring(compileError))
			return
		end
		local ran, err = pcall(chunk)
		if not ran then
			busy = false
			setLoading(entry, _i1III1l11("\224\226\241\251\251\1\196\31\33\217\51\59\47\71\80",115), true)
			warn(_i1III1l11("\208\220\218\238\247\243\242\216\43\39\66\66\62\74\78\98\49\35",128) .. entry.file .. _i1III1l11("\180\254\20\10\35\31\35\41\6\243",141) .. tostring(err))
			return
		end
		setLoading(entry, _i1III1l11("\19\13\16\26\54",154))
		task.wait(0.35)
		if ScreenGui.Parent then
			tween(Scale, 0.18, { Scale = 0.9 }):Play()
			tween(Main, 0.18, { BackgroundTransparency = 1 }):Play()
			task.delay(0.2, function() if ScreenGui.Parent then ScreenGui:Destroy() end end)
		end
	end)
end

for index, entry in ipairs(Games) do
	local card = Instance.new(_i1III1l11("\2\26\52\55\12\70\76\83\85\91",167))
	card.Name = entry.name
	card.Parent = List
	card.LayoutOrder = index
	card.BackgroundColor3 = T.Card
	card.BorderSizePixel = 0
	card.AutoButtonColor = false
	card.Text = ""
	corner(card, 14)
	local cardStroke = stroke(card, 0.5)
	grad(card, Color3.fromRGB(18, 18, 21), Color3.fromRGB(11, 11, 13))

	local icon = Instance.new(_i1III1l11("\4\47\42\55\60\42\70\78\88\102",180))
	icon.Name = _i1III1l11("\17\50\69\75",193)
	icon.Parent = card
	icon.BackgroundColor3 = T.Elev
	icon.BorderSizePixel = 0
	icon.Image = gameIcon(entry.icon)
	icon.ScaleType = Enum.ScaleType.Crop
	corner(icon, 12)
	stroke(icon, 0.55)

	local name = text(card, entry.name, 14, T.Text, Enum.Font.GothamMedium)
	name.Name = _i1III1l11("\41\69\87\86\86",206)
	name.TextTruncate = Enum.TextTruncate.AtEnd

	local desc = text(card, entry.desc, 11, T.Faint)
	desc.Name = _i1III1l11("\38\78\99\90",219)
	desc.TextTruncate = Enum.TextTruncate.AtEnd

	local play = Instance.new(_i1III1l11("\67\91\122\125\82\140\146\153\155\161",232))
	play.Name = _i1III1l11("\81\116\112\143",245)
	play.Parent = card
	play.BackgroundColor3 = T.Elev
	play.BorderSizePixel = 0
	play.AutoButtonColor = false
	play.Font = Enum.Font.GothamMedium
	play.Text = _i1III1l11("\90\86\113\113\109\121",7)
	play.TextColor3 = T.Text
	corner(play, 10)
	local playStroke = stroke(play, 0.5)

	local function hover(on)
		tween(card, 0.14, { BackgroundColor3 = on and T.Elev or T.Card }):Play()
		tween(cardStroke, 0.14, { Transparency = on and 0.25 or 0.5 }):Play()
		tween(play, 0.14, { BackgroundColor3 = on and T.White or T.Elev }):Play()
		play.TextColor3 = on and T.BG or T.Text
		tween(playStroke, 0.14, { Transparency = on and 1 or 0.5 }):Play()
	end
	card.MouseEnter:Connect(function() if not busy then hover(true) end end)
	card.MouseLeave:Connect(function() if not busy then hover(false) end end)
	play.MouseEnter:Connect(function() if not busy then hover(true) end end)
	play.MouseLeave:Connect(function() if not busy then hover(false) end end)

	card.MouseButton1Click:Connect(function() launch(entry) end)
	play.MouseButton1Click:Connect(function() launch(entry) end)

	Cards[index] = { card = card, icon = icon, name = name, desc = desc, play = play, entry = entry }
end

local Overlay = Instance.new(_i1III1l11("\97\148\138\157\156",20))
Overlay.Name = _i1III1l11("\116\158\151\161\169\189",33)
Overlay.Parent = Main
Overlay.BackgroundColor3 = T.BG
Overlay.BackgroundTransparency = 0.06
Overlay.BorderSizePixel = 0
Overlay.Size = UDim2.fromScale(1, 1)
Overlay.Visible = false
Overlay.ZIndex = 40

local OverlayIcon = Instance.new(_i1III1l11("\126\169\164\177\182\164\192\200\210\224",46))
OverlayIcon.Parent = Overlay
OverlayIcon.AnchorPoint = Vector2.new(0.5, 1)
OverlayIcon.BackgroundColor3 = T.Elev
OverlayIcon.BorderSizePixel = 0
OverlayIcon.ScaleType = Enum.ScaleType.Crop
OverlayIcon.ZIndex = 41
corner(OverlayIcon, 14)
stroke(OverlayIcon, 0.55)

local OverlayName = text(Overlay, "", 15, T.White, Enum.Font.GothamMedium)
OverlayName.AnchorPoint = Vector2.new(0.5, 0)
OverlayName.TextXAlignment = Enum.TextXAlignment.Center
OverlayName.ZIndex = 41

local OverlayStatus = text(Overlay, "", 11, T.Dim)
OverlayStatus.AnchorPoint = Vector2.new(0.5, 0)
OverlayStatus.TextXAlignment = Enum.TextXAlignment.Center
OverlayStatus.ZIndex = 41

local Track = Instance.new(_i1III1l11("\136\187\177\196\195",59))
Track.Parent = Overlay
Track.AnchorPoint = Vector2.new(0.5, 0)
Track.BackgroundColor3 = T.Elev
Track.BorderSizePixel = 0
Track.ZIndex = 41
corner(Track, 99)

local Sweep = Instance.new(_i1III1l11("\149\200\190\209\208",72))
Sweep.Parent = Track
Sweep.BackgroundColor3 = T.White
Sweep.BorderSizePixel = 0
Sweep.Size = UDim2.new(0.34, 0, 1, 0)
Sweep.ZIndex = 42
corner(Sweep, 99)

local sweepRunning = false
local function runSweep()
	if sweepRunning then return end
	sweepRunning = true
	task.spawn(function()
		while sweepRunning and Overlay.Visible do
			Sweep.Position = UDim2.fromScale(-0.34, 0)
			tween(Sweep, 0.85, { Position = UDim2.fromScale(1, 0) }, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut):Play()
			task.wait(0.95)
		end
		sweepRunning = false
	end)
end

setLoading = function(entry, status, failed)
	Overlay.Visible = true
	OverlayIcon.Image = gameIcon(entry.icon)
	OverlayName.Text = entry.name
	OverlayStatus.Text = status
	OverlayStatus.TextColor3 = failed and T.Bad or T.Dim
	Sweep.BackgroundColor3 = failed and T.Bad or T.White
	if failed then
		sweepRunning = false
		task.delay(1.8, function()
			if not busy then Overlay.Visible = false end
		end)
	else
		runSweep()
	end
end

local function fit()
	local camera = Workspace.CurrentCamera
	local vp = camera and camera.ViewportSize or Vector2.new(1280, 720)
	local portrait = vp.Y >= vp.X

	local pad = MOBILE and 16 or 18
	local headerH = MOBILE and 58 or 54

	local width, height
	if MOBILE then
		width = math.clamp(vp.X * (portrait and 0.92 or 0.6), 260, 460)

		local contentH = headerH + #Games * 72 + (#Games - 1) * 8 + pad + 6
		height = math.min(contentH, math.floor(vp.Y * 0.9))
	else
		width = math.clamp(vp.X - 80, 380, 620)
		height = math.clamp(vp.Y - 80, 260, 380)
	end
	Main.Size = UDim2.fromOffset(math.floor(width), math.floor(height))
	Header.Position = UDim2.fromOffset(pad, 0)
	Header.Size = UDim2.new(1, -pad * 2, 0, headerH)
	Brand.Position = UDim2.fromOffset(0, MOBILE and 10 or 9)
	Brand.Size = UDim2.fromOffset(160, 20)
	Brand.TextSize = MOBILE and 18 or 17
	BrandSub.Position = UDim2.fromOffset(0, MOBILE and 30 or 28)
	BrandSub.Size = UDim2.fromOffset(160, 14)

	local btn = MOBILE and 36 or 30
	Close.Position = UDim2.new(1, 0, 0.5, 0)
	Close.Size = UDim2.fromOffset(btn, btn)
	Close.TextSize = MOBILE and 22 or 19
	Switch.Position = UDim2.new(1, -(btn + 10), 0.5, 0)
	Switch.Size = UDim2.fromOffset(MOBILE and 132 or 118, btn)
	PcOption.TextSize = MOBILE and 12 or 11
	MobileOption.TextSize = MOBILE and 12 or 11

	List.Position = UDim2.fromOffset(pad, headerH)
	List.Size = UDim2.new(1, -pad * 2, 1, -(headerH + pad))
	Layout.FillDirection = MOBILE and Enum.FillDirection.Vertical or Enum.FillDirection.Horizontal
	Layout.Padding = UDim.new(0, MOBILE and 8 or 12)
	List.ScrollingEnabled = MOBILE
	List.AutomaticCanvasSize = MOBILE and Enum.AutomaticSize.Y or Enum.AutomaticSize.None
	List.ScrollingDirection = Enum.ScrollingDirection.Y

	for _, item in ipairs(Cards) do
		if MOBILE then

			local rowH = 72
			item.card.Size = UDim2.new(1, 0, 0, rowH)
			item.icon.Position = UDim2.fromOffset(10, 10)
			item.icon.Size = UDim2.fromOffset(rowH - 20, rowH - 20)
			item.name.Position = UDim2.fromOffset(rowH - 2, 15)
			item.name.Size = UDim2.new(1, -(rowH + 86), 0, 17)
			item.name.TextSize = 14
			item.desc.Position = UDim2.fromOffset(rowH - 2, 34)
			item.desc.Size = UDim2.new(1, -(rowH + 86), 0, 15)
			item.desc.TextSize = 11
			item.play.AnchorPoint = Vector2.new(1, 0.5)
			item.play.Position = UDim2.new(1, -10, 0.5, 0)
			item.play.Size = UDim2.fromOffset(70, 34)
			item.play.TextSize = 11
		else

			item.card.Size = UDim2.new(1 / #Cards, -8, 1, 0)
			local inner = math.floor(width - pad * 2 - 8 * (#Cards - 1))
			local tileW = math.floor(inner / #Cards)
			local iconSize = math.min(tileW - 24, math.floor(height - headerH - 118))
			item.icon.Position = UDim2.new(0.5, -math.floor(iconSize / 2), 0, 12)
			item.icon.Size = UDim2.fromOffset(iconSize, iconSize)
			item.name.Position = UDim2.fromOffset(12, 20 + iconSize)
			item.name.Size = UDim2.new(1, -24, 0, 18)
			item.name.TextSize = 14
			item.desc.Position = UDim2.fromOffset(12, 38 + iconSize)
			item.desc.Size = UDim2.new(1, -24, 0, 15)
			item.desc.TextSize = 11
			item.play.AnchorPoint = Vector2.new(0.5, 1)
			item.play.Position = UDim2.new(0.5, 0, 1, -12)
			item.play.Size = UDim2.new(1, -24, 0, 32)
			item.play.TextSize = 12
		end
	end

	local overlayIcon = MOBILE and 64 or 58
	OverlayIcon.Position = UDim2.new(0.5, 0, 0.5, -14)
	OverlayIcon.Size = UDim2.fromOffset(overlayIcon, overlayIcon)
	OverlayName.Position = UDim2.new(0.5, 0, 0.5, -6)
	OverlayName.Size = UDim2.new(1, -40, 0, 20)
	OverlayStatus.Position = UDim2.new(0.5, 0, 0.5, 16)
	OverlayStatus.Size = UDim2.new(1, -40, 0, 14)
	Track.Position = UDim2.new(0.5, 0, 0.5, 40)
	Track.Size = UDim2.new(0, math.floor(math.min(width - 80, 220)), 0, 3)
end

local function refreshSwitch()
	tween(SwitchPill, 0.18, {
		Position = MOBILE and UDim2.new(0.5, 2, 0, 3) or UDim2.new(0, 2, 0, 3),
	}, Enum.EasingStyle.Back):Play()
	PcOption.TextColor3 = MOBILE and T.Faint or T.White
	MobileOption.TextColor3 = MOBILE and T.White or T.Faint
	fit()
end
PcOption.MouseButton1Click:Connect(function() if not busy then MOBILE = false; refreshSwitch() end end)
MobileOption.MouseButton1Click:Connect(function() if not busy then MOBILE = true; refreshSwitch() end end)
refreshSwitch()

do
	local camera = Workspace.CurrentCamera
	if camera then camera:GetPropertyChangedSignal(_i1III1l11("\178\204\207\232\232\238\248\1\231\4\28\14",85)):Connect(fit) end
	Workspace:GetPropertyChangedSignal(_i1III1l11("\172\229\233\240\234\250\7\221\2\21\20\40\30",98)):Connect(function()
		local newCamera = Workspace.CurrentCamera
		if newCamera then fit(); newCamera:GetPropertyChangedSignal(_i1III1l11("\204\230\233\2\2\8\18\27\1\30\54\40",111)):Connect(fit) end
	end)
end

local function closeWindow()
	if not ScreenGui.Parent then return end
	tween(Scale, 0.16, { Scale = 0.94 }):Play()
	tween(Main, 0.16, { BackgroundTransparency = 1 }):Play()
	task.delay(0.18, function() if ScreenGui.Parent then ScreenGui:Destroy() end end)
end
Close.MouseEnter:Connect(function()
	tween(Close, 0.12, { BackgroundColor3 = T.Hover, TextColor3 = T.White }):Play()
	tween(closeStroke, 0.12, { Transparency = 0.25 }):Play()
end)
Close.MouseLeave:Connect(function()
	tween(Close, 0.12, { BackgroundColor3 = T.Elev, TextColor3 = T.Dim }):Play()
	tween(closeStroke, 0.12, { Transparency = 0.5 }):Play()
end)
Close.MouseButton1Click:Connect(closeWindow)

do
	local dragging, startPointer, startPosition
	Header.InputBegan:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
			local pos = input.Position
			local function over(gui)
				local p, s = gui.AbsolutePosition, gui.AbsoluteSize
				return pos.X >= p.X and pos.X <= p.X + s.X and pos.Y >= p.Y and pos.Y <= p.Y + s.Y
			end

			if over(Switch) or over(Close) then return end
			dragging = true; startPointer = input.Position; startPosition = Main.Position
			input.Changed:Connect(function()
				if input.UserInputState == Enum.UserInputState.End then dragging = false end
			end)
		end
	end)
	UserInputService.InputChanged:Connect(function(input)
		if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
			local delta = input.Position - startPointer
			Main.Position = UDim2.new(
				startPosition.X.Scale, startPosition.X.Offset + delta.X,
				startPosition.Y.Scale, startPosition.Y.Offset + delta.Y
			)
		end
	end)
end

tween(Scale, 0.26, { Scale = 1 }, Enum.EasingStyle.Back):Play()
tween(Main, 0.22, { Position = UDim2.fromScale(0.5, 0.5) }):Play()
