/**
 * Sorting Game Activity - Sort items into categories
 * 10 categories with difficulty system (easy/medium/hard)
 */

class SortingActivity {
    constructor() {
        this.categories = {
            colours: {
                label: 'Colours',
                baskets: [
                    { name: 'Red Things', emoji: '\uD83D\uDD34', items: [
                        { emoji: '\uD83C\uDF4E', label: 'Apple' },
                        { emoji: '\uD83C\uDF53', label: 'Strawberry' },
                        { emoji: '\u2764\uFE0F', label: 'Heart' },
                        { emoji: '\uD83C\uDF39', label: 'Rose' },
                        { emoji: '\uD83E\uDD80', label: 'Crab' },
                        { emoji: '\uD83C\uDF36\uFE0F', label: 'Pepper' },
                        { emoji: '\uD83C\uDF52', label: 'Cherry' }
                    ]},
                    { name: 'Blue Things', emoji: '\uD83D\uDD35', items: [
                        { emoji: '\uD83C\uDF0A', label: 'Wave' },
                        { emoji: '\uD83D\uDC8E', label: 'Diamond' },
                        { emoji: '\uD83D\uDC33', label: 'Whale' },
                        { emoji: '\uD83E\uDDCA', label: 'Ice' },
                        { emoji: '\uD83D\uDC99', label: 'Blue Heart' },
                        { emoji: '\uD83E\uDDD5', label: 'Jeans' },
                        { emoji: '\uD83C\uDF0C', label: 'Sky' }
                    ]}
                ],
                baskets_3: [
                    { name: 'Red Things', emoji: '\uD83D\uDD34', items: [
                        { emoji: '\uD83C\uDF4E', label: 'Apple' },
                        { emoji: '\uD83C\uDF53', label: 'Strawberry' },
                        { emoji: '\u2764\uFE0F', label: 'Heart' },
                        { emoji: '\uD83C\uDF39', label: 'Rose' },
                        { emoji: '\uD83E\uDD80', label: 'Crab' },
                        { emoji: '\uD83C\uDF36\uFE0F', label: 'Pepper' },
                        { emoji: '\uD83C\uDF52', label: 'Cherry' }
                    ]},
                    { name: 'Blue Things', emoji: '\uD83D\uDD35', items: [
                        { emoji: '\uD83C\uDF0A', label: 'Wave' },
                        { emoji: '\uD83D\uDC8E', label: 'Diamond' },
                        { emoji: '\uD83D\uDC33', label: 'Whale' },
                        { emoji: '\uD83E\uDDCA', label: 'Ice' },
                        { emoji: '\uD83D\uDC99', label: 'Blue Heart' },
                        { emoji: '\uD83E\uDDD5', label: 'Jeans' },
                        { emoji: '\uD83C\uDF0C', label: 'Sky' }
                    ]},
                    { name: 'Green Things', emoji: '\uD83D\uDFE2', items: [
                        { emoji: '\uD83C\uDF33', label: 'Tree' },
                        { emoji: '\uD83D\uDC38', label: 'Frog' },
                        { emoji: '\uD83E\uDD66', label: 'Broccoli' },
                        { emoji: '\uD83C\uDF40', label: 'Clover' },
                        { emoji: '\uD83E\uDD52', label: 'Cucumber' },
                        { emoji: '\uD83D\uDC22', label: 'Turtle' },
                        { emoji: '\uD83C\uDF4F', label: 'Green Apple' }
                    ]}
                ]
            },
            animals: {
                label: 'Animals',
                baskets: [
                    { name: 'Farm Animals', emoji: '\uD83C\uDFE1', items: [
                        { emoji: '\uD83D\uDC04', label: 'Cow' },
                        { emoji: '\uD83D\uDC14', label: 'Chicken' },
                        { emoji: '\uD83D\uDC37', label: 'Pig' },
                        { emoji: '\uD83D\uDC11', label: 'Sheep' },
                        { emoji: '\uD83D\uDC34', label: 'Horse' },
                        { emoji: '\uD83E\uDD86', label: 'Duck' },
                        { emoji: '\uD83D\uDC10', label: 'Goat' }
                    ]},
                    { name: 'Wild Animals', emoji: '\uD83C\uDF33', items: [
                        { emoji: '\uD83E\uDD81', label: 'Lion' },
                        { emoji: '\uD83D\uDC18', label: 'Elephant' },
                        { emoji: '\uD83D\uDC12', label: 'Monkey' },
                        { emoji: '\uD83E\uDD92', label: 'Giraffe' },
                        { emoji: '\uD83D\uDC3B', label: 'Bear' },
                        { emoji: '\uD83E\uDD93', label: 'Zebra' },
                        { emoji: '\uD83D\uDC2F', label: 'Tiger' }
                    ]}
                ],
                baskets_3: [
                    { name: 'Farm Animals', emoji: '\uD83C\uDFE1', items: [
                        { emoji: '\uD83D\uDC04', label: 'Cow' },
                        { emoji: '\uD83D\uDC14', label: 'Chicken' },
                        { emoji: '\uD83D\uDC37', label: 'Pig' },
                        { emoji: '\uD83D\uDC11', label: 'Sheep' },
                        { emoji: '\uD83D\uDC34', label: 'Horse' },
                        { emoji: '\uD83E\uDD86', label: 'Duck' },
                        { emoji: '\uD83D\uDC10', label: 'Goat' }
                    ]},
                    { name: 'Wild Animals', emoji: '\uD83C\uDF33', items: [
                        { emoji: '\uD83E\uDD81', label: 'Lion' },
                        { emoji: '\uD83D\uDC18', label: 'Elephant' },
                        { emoji: '\uD83D\uDC12', label: 'Monkey' },
                        { emoji: '\uD83E\uDD92', label: 'Giraffe' },
                        { emoji: '\uD83D\uDC3B', label: 'Bear' },
                        { emoji: '\uD83E\uDD93', label: 'Zebra' },
                        { emoji: '\uD83D\uDC2F', label: 'Tiger' }
                    ]},
                    { name: 'Pets', emoji: '\uD83D\uDC3E', items: [
                        { emoji: '\uD83D\uDC36', label: 'Dog' },
                        { emoji: '\uD83D\uDC31', label: 'Cat' },
                        { emoji: '\uD83D\uDC30', label: 'Rabbit' },
                        { emoji: '\uD83D\uDC39', label: 'Hamster' },
                        { emoji: '\uD83D\uDC20', label: 'Fish' },
                        { emoji: '\uD83D\uDC26', label: 'Bird' },
                        { emoji: '\uD83D\uDC22', label: 'Turtle' }
                    ]}
                ]
            },
            size: {
                label: 'Size',
                baskets: [
                    { name: 'Big Things', emoji: '\u2B06\uFE0F', items: [
                        { emoji: '\uD83D\uDC18', label: 'Elephant' },
                        { emoji: '\uD83C\uDFE0', label: 'House' },
                        { emoji: '\uD83C\uDF33', label: 'Tree' },
                        { emoji: '\uD83D\uDE8C', label: 'Bus' },
                        { emoji: '\uD83C\uDF0D', label: 'Earth' },
                        { emoji: '\uD83D\uDEA2', label: 'Ship' },
                        { emoji: '\uD83C\uDFD4\uFE0F', label: 'Mountain' }
                    ]},
                    { name: 'Small Things', emoji: '\u2B07\uFE0F', items: [
                        { emoji: '\uD83D\uDC1C', label: 'Ant' },
                        { emoji: '\uD83C\uDF53', label: 'Strawberry' },
                        { emoji: '\uD83D\uDD11', label: 'Key' },
                        { emoji: '\uD83D\uDC1B', label: 'Bug' },
                        { emoji: '\u2B50', label: 'Button' },
                        { emoji: '\uD83D\uDC8D', label: 'Ring' },
                        { emoji: '\uD83E\uDE99', label: 'Coin' }
                    ]}
                ],
                baskets_3: [
                    { name: 'Big Things', emoji: '\u2B06\uFE0F', items: [
                        { emoji: '\uD83D\uDC18', label: 'Elephant' },
                        { emoji: '\uD83C\uDFE0', label: 'House' },
                        { emoji: '\uD83C\uDF33', label: 'Tree' },
                        { emoji: '\uD83D\uDE8C', label: 'Bus' },
                        { emoji: '\uD83C\uDF0D', label: 'Earth' },
                        { emoji: '\uD83D\uDEA2', label: 'Ship' },
                        { emoji: '\uD83C\uDFD4\uFE0F', label: 'Mountain' }
                    ]},
                    { name: 'Small Things', emoji: '\u2B07\uFE0F', items: [
                        { emoji: '\uD83D\uDC1C', label: 'Ant' },
                        { emoji: '\uD83C\uDF53', label: 'Strawberry' },
                        { emoji: '\uD83D\uDD11', label: 'Key' },
                        { emoji: '\uD83D\uDC1B', label: 'Bug' },
                        { emoji: '\u2B50', label: 'Button' },
                        { emoji: '\uD83D\uDC8D', label: 'Ring' },
                        { emoji: '\uD83E\uDE99', label: 'Coin' }
                    ]},
                    { name: 'Medium Things', emoji: '\u2194\uFE0F', items: [
                        { emoji: '\uD83D\uDC36', label: 'Dog' },
                        { emoji: '\uD83D\uDEB2', label: 'Bicycle' },
                        { emoji: '\uD83E\uDE91', label: 'Chair' },
                        { emoji: '\uD83D\uDCFA', label: 'TV' },
                        { emoji: '\uD83C\uDF4E', label: 'Apple' },
                        { emoji: '\uD83D\uDCDA', label: 'Books' },
                        { emoji: '\uD83E\uDDF3', label: 'Suitcase' }
                    ]}
                ]
            },
            food: {
                label: 'Food',
                baskets: [
                    { name: 'Fruits', emoji: '\uD83C\uDF4E', items: [
                        { emoji: '\uD83C\uDF4C', label: 'Banana' },
                        { emoji: '\uD83C\uDF47', label: 'Grapes' },
                        { emoji: '\uD83C\uDF4A', label: 'Orange' },
                        { emoji: '\uD83C\uDF49', label: 'Watermelon' },
                        { emoji: '\uD83C\uDF51', label: 'Peach' },
                        { emoji: '\uD83C\uDF53', label: 'Strawberry' },
                        { emoji: '\uD83C\uDF4D', label: 'Pineapple' }
                    ]},
                    { name: 'Vegetables', emoji: '\uD83E\uDD66', items: [
                        { emoji: '\uD83E\uDD55', label: 'Carrot' },
                        { emoji: '\uD83C\uDF3D', label: 'Corn' },
                        { emoji: '\uD83E\uDD52', label: 'Cucumber' },
                        { emoji: '\uD83C\uDF36\uFE0F', label: 'Pepper' },
                        { emoji: '\uD83E\uDD54', label: 'Potato' },
                        { emoji: '\uD83C\uDF45', label: 'Tomato' },
                        { emoji: '\uD83E\uDD66', label: 'Broccoli' }
                    ]}
                ],
                baskets_3: [
                    { name: 'Fruits', emoji: '\uD83C\uDF4E', items: [
                        { emoji: '\uD83C\uDF4C', label: 'Banana' },
                        { emoji: '\uD83C\uDF47', label: 'Grapes' },
                        { emoji: '\uD83C\uDF4A', label: 'Orange' },
                        { emoji: '\uD83C\uDF49', label: 'Watermelon' },
                        { emoji: '\uD83C\uDF51', label: 'Peach' },
                        { emoji: '\uD83C\uDF53', label: 'Strawberry' },
                        { emoji: '\uD83C\uDF4D', label: 'Pineapple' }
                    ]},
                    { name: 'Vegetables', emoji: '\uD83E\uDD66', items: [
                        { emoji: '\uD83E\uDD55', label: 'Carrot' },
                        { emoji: '\uD83C\uDF3D', label: 'Corn' },
                        { emoji: '\uD83E\uDD52', label: 'Cucumber' },
                        { emoji: '\uD83C\uDF36\uFE0F', label: 'Pepper' },
                        { emoji: '\uD83E\uDD54', label: 'Potato' },
                        { emoji: '\uD83C\uDF45', label: 'Tomato' },
                        { emoji: '\uD83E\uDD66', label: 'Broccoli' }
                    ]},
                    { name: 'Treats', emoji: '\uD83C\uDF6C', items: [
                        { emoji: '\uD83C\uDF70', label: 'Cake' },
                        { emoji: '\uD83C\uDF66', label: 'Ice Cream' },
                        { emoji: '\uD83C\uDF6A', label: 'Cookie' },
                        { emoji: '\uD83C\uDF6B', label: 'Chocolate' },
                        { emoji: '\uD83C\uDF69', label: 'Donut' },
                        { emoji: '\uD83C\uDF6D', label: 'Lollipop' },
                        { emoji: '\uD83E\uDDC1', label: 'Cupcake' }
                    ]}
                ]
            },
            weather: {
                label: 'Weather',
                baskets: [
                    { name: 'Sunny Days', emoji: '\u2600\uFE0F', items: [
                        { emoji: '\uD83D\uDE0E', label: 'Sunglasses' },
                        { emoji: '\uD83C\uDFD6\uFE0F', label: 'Beach' },
                        { emoji: '\uD83C\uDF66', label: 'Ice Cream' },
                        { emoji: '\uD83E\uDDE4', label: 'Sun Hat' },
                        { emoji: '\uD83C\uDF1E', label: 'Sun' },
                        { emoji: '\uD83D\uDCA6', label: 'Sweat' },
                        { emoji: '\uD83C\uDF3B', label: 'Sunflower' }
                    ]},
                    { name: 'Rainy Days', emoji: '\uD83C\uDF27\uFE0F', items: [
                        { emoji: '\u2602\uFE0F', label: 'Umbrella' },
                        { emoji: '\uD83C\uDF27\uFE0F', label: 'Rain' },
                        { emoji: '\uD83E\uDD62', label: 'Boots' },
                        { emoji: '\uD83D\uDC38', label: 'Frog' },
                        { emoji: '\uD83C\uDF08', label: 'Rainbow' },
                        { emoji: '\uD83D\uDCA7', label: 'Puddle' },
                        { emoji: '\u2601\uFE0F', label: 'Cloud' }
                    ]}
                ],
                baskets_3: [
                    { name: 'Sunny Days', emoji: '\u2600\uFE0F', items: [
                        { emoji: '\uD83D\uDE0E', label: 'Sunglasses' },
                        { emoji: '\uD83C\uDFD6\uFE0F', label: 'Beach' },
                        { emoji: '\uD83C\uDF66', label: 'Ice Cream' },
                        { emoji: '\uD83E\uDDE4', label: 'Sun Hat' },
                        { emoji: '\uD83C\uDF1E', label: 'Sun' },
                        { emoji: '\uD83D\uDCA6', label: 'Sweat' },
                        { emoji: '\uD83C\uDF3B', label: 'Sunflower' }
                    ]},
                    { name: 'Rainy Days', emoji: '\uD83C\uDF27\uFE0F', items: [
                        { emoji: '\u2602\uFE0F', label: 'Umbrella' },
                        { emoji: '\uD83C\uDF27\uFE0F', label: 'Rain' },
                        { emoji: '\uD83E\uDD62', label: 'Boots' },
                        { emoji: '\uD83D\uDC38', label: 'Frog' },
                        { emoji: '\uD83C\uDF08', label: 'Rainbow' },
                        { emoji: '\uD83D\uDCA7', label: 'Puddle' },
                        { emoji: '\u2601\uFE0F', label: 'Cloud' }
                    ]},
                    { name: 'Windy Days', emoji: '\uD83C\uDF2C\uFE0F', items: [
                        { emoji: '\uD83C\uDF43', label: 'Leaf' },
                        { emoji: '\uD83E\uDE81', label: 'Kite' },
                        { emoji: '\uD83C\uDF2A\uFE0F', label: 'Tornado' },
                        { emoji: '\uD83E\uDDE3', label: 'Scarf' },
                        { emoji: '\uD83C\uDF90', label: 'Windsock' },
                        { emoji: '\uD83C\uDFF4', label: 'Flag' },
                        { emoji: '\uD83D\uDCA8', label: 'Wind' }
                    ]}
                ]
            },
            vehicles: {
                label: 'Vehicles',
                baskets: [
                    { name: 'On Land', emoji: '\uD83D\uDE97', items: [
                        { emoji: '\uD83D\uDE97', label: 'Car' },
                        { emoji: '\uD83D\uDE8C', label: 'Bus' },
                        { emoji: '\uD83D\uDEB2', label: 'Bicycle' },
                        { emoji: '\uD83D\uDE82', label: 'Train' },
                        { emoji: '\uD83D\uDE92', label: 'Fire Truck' },
                        { emoji: '\uD83C\uDFCD\uFE0F', label: 'Motorbike' },
                        { emoji: '\uD83D\uDE9A', label: 'Truck' }
                    ]},
                    { name: 'In the Sky', emoji: '\u2708\uFE0F', items: [
                        { emoji: '\u2708\uFE0F', label: 'Plane' },
                        { emoji: '\uD83D\uDE81', label: 'Helicopter' },
                        { emoji: '\uD83D\uDE80', label: 'Rocket' },
                        { emoji: '\uD83E\uDE82', label: 'Balloon' },
                        { emoji: '\uD83D\uDEF8', label: 'UFO' },
                        { emoji: '\uD83E\uDE82', label: 'Glider' },
                        { emoji: '\uD83D\uDEF0\uFE0F', label: 'Satellite' }
                    ]}
                ],
                baskets_3: [
                    { name: 'On Land', emoji: '\uD83D\uDE97', items: [
                        { emoji: '\uD83D\uDE97', label: 'Car' },
                        { emoji: '\uD83D\uDE8C', label: 'Bus' },
                        { emoji: '\uD83D\uDEB2', label: 'Bicycle' },
                        { emoji: '\uD83D\uDE82', label: 'Train' },
                        { emoji: '\uD83D\uDE92', label: 'Fire Truck' },
                        { emoji: '\uD83C\uDFCD\uFE0F', label: 'Motorbike' },
                        { emoji: '\uD83D\uDE9A', label: 'Truck' }
                    ]},
                    { name: 'In the Sky', emoji: '\u2708\uFE0F', items: [
                        { emoji: '\u2708\uFE0F', label: 'Plane' },
                        { emoji: '\uD83D\uDE81', label: 'Helicopter' },
                        { emoji: '\uD83D\uDE80', label: 'Rocket' },
                        { emoji: '\uD83E\uDE82', label: 'Balloon' },
                        { emoji: '\uD83D\uDEF8', label: 'UFO' },
                        { emoji: '\uD83E\uDE82', label: 'Glider' },
                        { emoji: '\uD83D\uDEF0\uFE0F', label: 'Satellite' }
                    ]},
                    { name: 'On Water', emoji: '\u26F5', items: [
                        { emoji: '\uD83D\uDEA2', label: 'Ship' },
                        { emoji: '\u26F5', label: 'Sailboat' },
                        { emoji: '\uD83D\uDEF6', label: 'Canoe' },
                        { emoji: '\uD83D\uDEA4', label: 'Speedboat' },
                        { emoji: '\uD83D\uDEE5\uFE0F', label: 'Ferry' },
                        { emoji: '\uD83D\uDEF3\uFE0F', label: 'Cruise' },
                        { emoji: '\uD83C\uDFA3', label: 'Fishing Boat' }
                    ]}
                ]
            },
            emotions: {
                label: 'Emotions',
                baskets: [
                    { name: 'Happy', emoji: '\uD83D\uDE0A', items: [
                        { emoji: '\uD83D\uDE02', label: 'Laughing' },
                        { emoji: '\uD83E\uDD29', label: 'Star Eyes' },
                        { emoji: '\uD83C\uDF89', label: 'Party' },
                        { emoji: '\uD83C\uDF81', label: 'Gift' },
                        { emoji: '\uD83C\uDF08', label: 'Rainbow' },
                        { emoji: '\uD83C\uDF1E', label: 'Sunshine' },
                        { emoji: '\uD83C\uDF82', label: 'Birthday' }
                    ]},
                    { name: 'Sad', emoji: '\uD83D\uDE22', items: [
                        { emoji: '\uD83D\uDE22', label: 'Crying' },
                        { emoji: '\uD83D\uDE1E', label: 'Disappointed' },
                        { emoji: '\uD83C\uDF27\uFE0F', label: 'Rain' },
                        { emoji: '\uD83D\uDC94', label: 'Broken Heart' },
                        { emoji: '\uD83D\uDE14', label: 'Pensive' },
                        { emoji: '\uD83E\uDD15', label: 'Hurt' },
                        { emoji: '\uD83D\uDE3F', label: 'Sad Cat' }
                    ]}
                ],
                baskets_3: [
                    { name: 'Happy', emoji: '\uD83D\uDE0A', items: [
                        { emoji: '\uD83D\uDE02', label: 'Laughing' },
                        { emoji: '\uD83E\uDD29', label: 'Star Eyes' },
                        { emoji: '\uD83C\uDF89', label: 'Party' },
                        { emoji: '\uD83C\uDF81', label: 'Gift' },
                        { emoji: '\uD83C\uDF08', label: 'Rainbow' },
                        { emoji: '\uD83C\uDF1E', label: 'Sunshine' },
                        { emoji: '\uD83C\uDF82', label: 'Birthday' }
                    ]},
                    { name: 'Sad', emoji: '\uD83D\uDE22', items: [
                        { emoji: '\uD83D\uDE22', label: 'Crying' },
                        { emoji: '\uD83D\uDE1E', label: 'Disappointed' },
                        { emoji: '\uD83C\uDF27\uFE0F', label: 'Rain' },
                        { emoji: '\uD83D\uDC94', label: 'Broken Heart' },
                        { emoji: '\uD83D\uDE14', label: 'Pensive' },
                        { emoji: '\uD83E\uDD15', label: 'Hurt' },
                        { emoji: '\uD83D\uDE3F', label: 'Sad Cat' }
                    ]},
                    { name: 'Surprised', emoji: '\uD83D\uDE32', items: [
                        { emoji: '\uD83D\uDE32', label: 'Surprised' },
                        { emoji: '\uD83E\uDD2F', label: 'Mind Blown' },
                        { emoji: '\uD83C\uDF86', label: 'Fireworks' },
                        { emoji: '\uD83D\uDC7B', label: 'Ghost' },
                        { emoji: '\uD83C\uDFA9', label: 'Magic Hat' },
                        { emoji: '\u2757', label: 'Exclaim' },
                        { emoji: '\uD83D\uDE31', label: 'Scream' }
                    ]}
                ]
            },
            nature: {
                label: 'Nature',
                baskets: [
                    { name: 'Land', emoji: '\uD83C\uDFD4\uFE0F', items: [
                        { emoji: '\uD83C\uDF33', label: 'Tree' },
                        { emoji: '\uD83C\uDF3B', label: 'Sunflower' },
                        { emoji: '\uD83C\uDFD4\uFE0F', label: 'Mountain' },
                        { emoji: '\uD83C\uDF35', label: 'Cactus' },
                        { emoji: '\uD83C\uDF44', label: 'Mushroom' },
                        { emoji: '\uD83E\uDEB5', label: 'Log' },
                        { emoji: '\uD83C\uDF3E', label: 'Wheat' }
                    ]},
                    { name: 'Water', emoji: '\uD83C\uDF0A', items: [
                        { emoji: '\uD83C\uDF0A', label: 'Wave' },
                        { emoji: '\uD83D\uDC1F', label: 'Fish' },
                        { emoji: '\uD83D\uDC19', label: 'Octopus' },
                        { emoji: '\uD83D\uDC33', label: 'Whale' },
                        { emoji: '\uD83E\uDEB8', label: 'Coral' },
                        { emoji: '\uD83D\uDC1A', label: 'Shell' },
                        { emoji: '\uD83E\uDD80', label: 'Crab' }
                    ]}
                ],
                baskets_3: [
                    { name: 'Land', emoji: '\uD83C\uDFD4\uFE0F', items: [
                        { emoji: '\uD83C\uDF33', label: 'Tree' },
                        { emoji: '\uD83C\uDF3B', label: 'Sunflower' },
                        { emoji: '\uD83C\uDFD4\uFE0F', label: 'Mountain' },
                        { emoji: '\uD83C\uDF35', label: 'Cactus' },
                        { emoji: '\uD83C\uDF44', label: 'Mushroom' },
                        { emoji: '\uD83E\uDEB5', label: 'Log' },
                        { emoji: '\uD83C\uDF3E', label: 'Wheat' }
                    ]},
                    { name: 'Water', emoji: '\uD83C\uDF0A', items: [
                        { emoji: '\uD83C\uDF0A', label: 'Wave' },
                        { emoji: '\uD83D\uDC1F', label: 'Fish' },
                        { emoji: '\uD83D\uDC19', label: 'Octopus' },
                        { emoji: '\uD83D\uDC33', label: 'Whale' },
                        { emoji: '\uD83E\uDEB8', label: 'Coral' },
                        { emoji: '\uD83D\uDC1A', label: 'Shell' },
                        { emoji: '\uD83E\uDD80', label: 'Crab' }
                    ]},
                    { name: 'Sky', emoji: '\uD83C\uDF24\uFE0F', items: [
                        { emoji: '\u2601\uFE0F', label: 'Cloud' },
                        { emoji: '\uD83C\uDF08', label: 'Rainbow' },
                        { emoji: '\u2B50', label: 'Star' },
                        { emoji: '\uD83C\uDF19', label: 'Moon' },
                        { emoji: '\u2600\uFE0F', label: 'Sun' },
                        { emoji: '\uD83D\uDC26', label: 'Bird' },
                        { emoji: '\uD83E\uDD8B', label: 'Butterfly' }
                    ]}
                ]
            },
            hot_cold: {
                label: 'Hot & Cold',
                baskets: [
                    { name: 'Hot', emoji: '\uD83D\uDD25', items: [
                        { emoji: '\uD83D\uDD25', label: 'Fire' },
                        { emoji: '\u2600\uFE0F', label: 'Sun' },
                        { emoji: '\uD83C\uDF0B', label: 'Volcano' },
                        { emoji: '\u2615', label: 'Hot Tea' },
                        { emoji: '\uD83C\uDF36\uFE0F', label: 'Chilli' },
                        { emoji: '\uD83C\uDFDC\uFE0F', label: 'Desert' },
                        { emoji: '\uD83C\uDF55', label: 'Pizza' }
                    ]},
                    { name: 'Cold', emoji: '\u2744\uFE0F', items: [
                        { emoji: '\u2744\uFE0F', label: 'Snowflake' },
                        { emoji: '\u26C4', label: 'Snowman' },
                        { emoji: '\uD83C\uDF66', label: 'Ice Cream' },
                        { emoji: '\uD83E\uDDCA', label: 'Ice' },
                        { emoji: '\uD83D\uDC27', label: 'Penguin' },
                        { emoji: '\uD83E\uDDCA', label: 'Igloo' },
                        { emoji: '\uD83C\uDF28\uFE0F', label: 'Snow' }
                    ]}
                ],
                baskets_3: [
                    { name: 'Hot', emoji: '\uD83D\uDD25', items: [
                        { emoji: '\uD83D\uDD25', label: 'Fire' },
                        { emoji: '\u2600\uFE0F', label: 'Sun' },
                        { emoji: '\uD83C\uDF0B', label: 'Volcano' },
                        { emoji: '\u2615', label: 'Hot Tea' },
                        { emoji: '\uD83C\uDF36\uFE0F', label: 'Chilli' },
                        { emoji: '\uD83C\uDFDC\uFE0F', label: 'Desert' },
                        { emoji: '\uD83C\uDF55', label: 'Pizza' }
                    ]},
                    { name: 'Cold', emoji: '\u2744\uFE0F', items: [
                        { emoji: '\u2744\uFE0F', label: 'Snowflake' },
                        { emoji: '\u26C4', label: 'Snowman' },
                        { emoji: '\uD83C\uDF66', label: 'Ice Cream' },
                        { emoji: '\uD83E\uDDCA', label: 'Ice' },
                        { emoji: '\uD83D\uDC27', label: 'Penguin' },
                        { emoji: '\uD83E\uDDCA', label: 'Igloo' },
                        { emoji: '\uD83C\uDF28\uFE0F', label: 'Snow' }
                    ]},
                    { name: 'Warm', emoji: '\uD83C\uDF24\uFE0F', items: [
                        { emoji: '\uD83C\uDF3B', label: 'Sunflower' },
                        { emoji: '\uD83E\uDDE3', label: 'Light Jacket' },
                        { emoji: '\uD83C\uDF42', label: 'Autumn Leaf' },
                        { emoji: '\uD83E\uDD5B', label: 'Warm Milk' },
                        { emoji: '\uD83C\uDF1E', label: 'Warm Sun' },
                        { emoji: '\uD83E\uDDCA', label: 'Blanket' },
                        { emoji: '\uD83C\uDF75', label: 'Green Tea' }
                    ]}
                ]
            },
            day_night: {
                label: 'Day & Night',
                baskets: [
                    { name: 'Daytime', emoji: '\u2600\uFE0F', items: [
                        { emoji: '\u2600\uFE0F', label: 'Sun' },
                        { emoji: '\uD83D\uDE0E', label: 'Sunglasses' },
                        { emoji: '\uD83C\uDFEB', label: 'School' },
                        { emoji: '\uD83C\uDF3B', label: 'Sunflower' },
                        { emoji: '\uD83E\uDD8B', label: 'Butterfly' },
                        { emoji: '\u26BD', label: 'Football' },
                        { emoji: '\uD83C\uDFDE\uFE0F', label: 'Park' }
                    ]},
                    { name: 'Nighttime', emoji: '\uD83C\uDF19', items: [
                        { emoji: '\uD83C\uDF19', label: 'Moon' },
                        { emoji: '\u2B50', label: 'Stars' },
                        { emoji: '\uD83D\uDCA4', label: 'Sleeping' },
                        { emoji: '\uD83E\uDD89', label: 'Owl' },
                        { emoji: '\uD83D\uDD6F\uFE0F', label: 'Candle' },
                        { emoji: '\uD83D\uDECF\uFE0F', label: 'Bed' },
                        { emoji: '\uD83D\uDCDA', label: 'Bedtime Story' }
                    ]}
                ],
                baskets_3: [
                    { name: 'Daytime', emoji: '\u2600\uFE0F', items: [
                        { emoji: '\u2600\uFE0F', label: 'Sun' },
                        { emoji: '\uD83D\uDE0E', label: 'Sunglasses' },
                        { emoji: '\uD83C\uDFEB', label: 'School' },
                        { emoji: '\uD83C\uDF3B', label: 'Sunflower' },
                        { emoji: '\uD83E\uDD8B', label: 'Butterfly' },
                        { emoji: '\u26BD', label: 'Football' },
                        { emoji: '\uD83C\uDFDE\uFE0F', label: 'Park' }
                    ]},
                    { name: 'Nighttime', emoji: '\uD83C\uDF19', items: [
                        { emoji: '\uD83C\uDF19', label: 'Moon' },
                        { emoji: '\u2B50', label: 'Stars' },
                        { emoji: '\uD83D\uDCA4', label: 'Sleeping' },
                        { emoji: '\uD83E\uDD89', label: 'Owl' },
                        { emoji: '\uD83D\uDD6F\uFE0F', label: 'Candle' },
                        { emoji: '\uD83D\uDECF\uFE0F', label: 'Bed' },
                        { emoji: '\uD83D\uDCDA', label: 'Bedtime Story' }
                    ]},
                    { name: 'Twilight', emoji: '\uD83C\uDF05', items: [
                        { emoji: '\uD83C\uDF05', label: 'Sunset' },
                        { emoji: '\uD83C\uDF06', label: 'Dusk' },
                        { emoji: '\uD83E\uDD87', label: 'Bat' },
                        { emoji: '\uD83C\uDF03', label: 'Night Sky' },
                        { emoji: '\uD83D\uDD26', label: 'Torch' },
                        { emoji: '\uD83E\uDDA0', label: 'Firefly' },
                        { emoji: '\uD83C\uDF04', label: 'Sunrise' }
                    ]}
                ]
            }
        };

        this.difficulties = {
            easy:   { baskets: 2, items: 5 },
            medium: { baskets: 3, items: 5 },
            hard:   { baskets: 3, items: 7 }
        };

        this.currentCategory = 'colours';
        this.currentDifficulty = 'easy';
        this.itemQueue = [];
        this.currentItem = null;
        this.currentBasketIndex = -1;
        this.score = 0;
        this.streak = 0;
        this.processing = false;
        this.rewards = null;
    }

    async start() {
        console.log('Starting Sorting Game activity');

        // Set up rewards
        if (typeof RewardsManager !== 'undefined') {
            this.rewards = new RewardsManager();
            await this.rewards.loadProgress();
            this.rewards.renderProgressPanel('sortingProgressDisplay', 'sorting');
        }

        // Set up difficulty and category buttons
        this.setupDifficultyButtons();
        this.setupCategoryButtons();

        // Character wave
        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }

        this.startNewRound();
    }

    setupDifficultyButtons() {
        const container = document.getElementById('sortingDifficulty');
        if (!container) return;

        container.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDifficulty = btn.dataset.difficulty;
                this.score = 0;
                this.streak = 0;
                this.startNewRound();
            });
        });
    }

    setupCategoryButtons() {
        const container = document.getElementById('sortingCategory');
        if (!container) return;

        container.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.score = 0;
                this.streak = 0;
                this.startNewRound();
            });
        });
    }

    startNewRound() {
        const category = this.categories[this.currentCategory];
        if (!category) return;

        const diff = this.difficulties[this.currentDifficulty];
        const useThreeBaskets = diff.baskets === 3;
        const itemsPerBasket = diff.items;

        // Pick basket set based on difficulty
        let baskets;
        if (useThreeBaskets && category.baskets_3) {
            baskets = category.baskets_3;
        } else {
            baskets = category.baskets;
        }

        // Build item queue from selected baskets, limited to itemsPerBasket each
        this.itemQueue = [];
        baskets.forEach((basket, basketIdx) => {
            const items = basket.items.slice(0, itemsPerBasket);
            items.forEach(item => {
                this.itemQueue.push({ ...item, correctBasket: basketIdx });
            });
        });
        this.itemQueue.sort(() => Math.random() - 0.5);

        // Render baskets
        this.renderBaskets(baskets);

        // Show first item
        this.showNextItem();
    }

    renderBaskets(baskets) {
        const basketsContainer = document.getElementById('sortingBaskets');
        if (!basketsContainer) return;

        // Toggle 3-basket CSS class
        if (baskets.length === 3) {
            basketsContainer.classList.add('baskets-3');
        } else {
            basketsContainer.classList.remove('baskets-3');
        }

        basketsContainer.innerHTML = baskets.map((basket, i) => `
            <div class="sorting-basket" data-basket="${i}">
                <span class="sorting-basket-emoji">${basket.emoji}</span>
                <span class="sorting-basket-label">${basket.name}</span>
            </div>
        `).join('');

        basketsContainer.querySelectorAll('.sorting-basket').forEach(basketEl => {
            basketEl.addEventListener('click', () => this.handleBasketClick(basketEl));
        });

        // Voice all basket names so toddlers who can't read know what each basket is
        const basketNames = baskets.map(b => b.name).join('.. and.. ');
        const introText = `Sort into.. ${basketNames}`;
        AppAPI.call('speak', introText);

        // Update score display
        this.updateScore();
    }

    showNextItem() {
        const itemContainer = document.getElementById('sortingItem');
        if (!itemContainer) return;

        if (this.itemQueue.length === 0) {
            // Round complete, restart with fresh items
            this.startNewRound();
            return;
        }

        this.currentItem = this.itemQueue.shift();

        itemContainer.innerHTML = `
            <div class="sorting-item-card" data-basket="${this.currentItem.correctBasket}">
                ${this.currentItem.emoji}
                <div class="item-label">${this.currentItem.label}</div>
            </div>
        `;

        // Speak item name for non-readers
        const itemText = window.DinoPhrase ? window.DinoPhrase('sorting', 'item_appear', { target: this.currentItem.label }) : this.currentItem.label;
        AppAPI.call('speak', itemText);
    }

    async handleBasketClick(basketEl) {
        if (this.processing || !this.currentItem) return;
        this.processing = true;

        const basketIndex = parseInt(basketEl.dataset.basket);

        if (basketIndex === this.currentItem.correctBasket) {
            // Correct!
            basketEl.classList.add('correct-flash');
            this.score++;
            this.streak++;

            if (window.characterManager) {
                window.characterManager.playAnimation('happy', false);
            }

            // Award star
            const starResult = await AppAPI.call('award_stars', 'sorting', 1);
            if (starResult && this.rewards) {
                this.rewards.playStarAnimation('sortingStarAnimation');
                this.rewards.updateStarCount(starResult.total_stars);
                const milestones = await this.rewards.checkMilestones(starResult.total_stars);
                milestones.forEach(r => this.rewards.showRewardAnimation(r));
            }

            // Streak bonus
            if (this.streak > 0 && this.streak % 5 === 0) {
                const bonusResult = await AppAPI.call('award_stars', 'sorting', 1);
                if (bonusResult && this.rewards) {
                    this.rewards.updateStarCount(bonusResult.total_stars);
                }
            }

            const correctText = window.DinoPhrase ? window.DinoPhrase('sorting', 'correct') : 'Right!';
            AppAPI.call('speak', correctText);

            this.updateScore();

            setTimeout(() => {
                basketEl.classList.remove('correct-flash');
                this.processing = false;
                this.showNextItem();
            }, 800);

        } else {
            // Wrong basket
            basketEl.classList.add('wrong-flash');
            this.streak = 0;

            if (window.characterManager) {
                window.characterManager.playAnimation('thinking', false);
            }

            const wrongText = window.DinoPhrase ? window.DinoPhrase('sorting', 'wrong') : 'Try another one!';
            AppAPI.call('speak', wrongText);

            this.updateScore();

            setTimeout(() => {
                basketEl.classList.remove('wrong-flash');
                this.processing = false;
            }, 500);
        }
    }

    updateScore() {
        const scoreEl = document.getElementById('sortingScore');
        if (scoreEl) {
            const streakText = this.streak >= 3 ? ` \uD83D\uDD25 ${this.streak} streak!` : '';
            scoreEl.textContent = `Score: ${this.score}${streakText}`;
        }
    }

    stop() {
        console.log('Stopping Sorting Game activity');
    }
}
