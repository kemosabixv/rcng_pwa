<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create blog manager users first if they don't exist
        $blogManagers = [
            [
                'name' => 'Jennifer Adams',
                'email' => 'jennifer.adams@rcng.local',
                'password' => bcrypt('password'),
                'role' => 'blog_manager',
                'status' => 'active',
                'profession' => 'Communications Director',
                'company' => 'RCNG',
                'phone' => '+254-700-123-456',
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael.chen@rcng.local',
                'password' => bcrypt('password'),
                'role' => 'blog_manager',
                'status' => 'active',
                'profession' => 'Project Manager',
                'company' => 'RCNG',
                'phone' => '+254-700-123-457',
            ],
            [
                'name' => 'Sarah Wilson',
                'email' => 'sarah.wilson@rcng.local',
                'password' => bcrypt('password'),
                'role' => 'blog_manager',
                'status' => 'active',
                'profession' => 'Youth Program Coordinator',
                'company' => 'RCNG',
                'phone' => '+254-700-123-458',
            ],
        ];

        foreach ($blogManagers as $managerData) {
            User::firstOrCreate(
                ['email' => $managerData['email']],
                $managerData
            );
        }

        // Get blog manager users
        $jennifer = User::where('email', 'jennifer.adams@rcng.local')->first();
        $michael = User::where('email', 'michael.chen@rcng.local')->first();
        $sarah = User::where('email', 'sarah.wilson@rcng.local')->first();

        // Create specific blog posts from the current frontend
        $blogPosts = [
            [
                'title' => 'Reflecting on Our Annual Community Food Drive Success',
                'slug' => 'reflecting-on-our-annual-community-food-drive-success',
                'excerpt' => "This year's community food drive exceeded all expectations, collecting over 5,000 pounds of food donations for local families in need. Here's how our club came together to make it happen.",
                'content' => $this->getFoodDriveContent(),
                'category' => 'Community Service',
                'featured_image' => 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&h=300',
                'is_featured' => true,
                'is_published' => true,
                'published_at' => Carbon::parse('2025-03-10'),
                'views' => 234,
                'read_time' => 5,
                'tags' => ['Community Service', 'Food Drive', 'Charity', 'Local Impact'],
                'meta_description' => 'Our annual community food drive exceeded expectations, collecting over 5,000 pounds of food for local families in need.',
                'author_id' => $jennifer->id,
            ],
            [
                'title' => 'New Water Well Project in Guatemala Shows Immediate Impact',
                'slug' => 'new-water-well-project-guatemala-immediate-impact',
                'excerpt' => 'Six months after completion, our water well project in rural Guatemala is providing clean drinking water to over 1,200 people. Local community leaders share their gratitude and the transformative effects.',
                'content' => $this->getWaterWellContent(),
                'category' => 'International Projects',
                'featured_image' => 'https://images.unsplash.com/photo-1597149840634-2de02abd9c68?auto=format&fit=crop&w=600&h=300',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => Carbon::parse('2025-03-05'),
                'views' => 456,
                'read_time' => 7,
                'tags' => ['International', 'Water', 'Guatemala', 'Global Impact'],
                'meta_description' => 'Our water well project in Guatemala provides clean drinking water to over 1,200 people.',
                'author_id' => $michael->id,
            ],
            [
                'title' => 'Youth Leadership Academy Graduates First Class',
                'slug' => 'youth-leadership-academy-graduates-first-class',
                'excerpt' => 'Twenty-five local high school students completed our inaugural Youth Leadership Academy program, developing skills in public speaking, project management, and community service leadership.',
                'content' => $this->getYouthAcademyContent(),
                'category' => 'Youth Programs',
                'featured_image' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?auto=format&fit=crop&w=600&h=300',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => Carbon::parse('2025-02-28'),
                'views' => 189,
                'read_time' => 4,
                'tags' => ['Youth', 'Leadership', 'Education', 'Skills Development'],
                'meta_description' => 'Twenty-five local high school students completed our inaugural Youth Leadership Academy program.',
                'author_id' => $sarah->id,
            ],
            [
                'title' => "How Rotary's Four-Way Test Guides Our Business Decisions",
                'slug' => 'rotary-four-way-test-guides-business-decisions',
                'excerpt' => "In this member spotlight, local business owner David Brown shares how applying Rotary's Four-Way Test has transformed his approach to ethical business practices and community engagement.",
                'content' => $this->getFourWayTestContent(),
                'category' => 'Member Spotlight',
                'featured_image' => 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&h=300',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => Carbon::parse('2025-02-22'),
                'views' => 312,
                'read_time' => 6,
                'tags' => ['Ethics', 'Business', 'Four-Way Test', 'Member Spotlight'],
                'meta_description' => "Local business owner shares how Rotary's Four-Way Test transformed his ethical business practices.",
                'author_id' => $jennifer->id,
            ],
            [
                'title' => 'Partnership with Local Schools Expands Literacy Program',
                'slug' => 'partnership-local-schools-expands-literacy-program',
                'excerpt' => 'Our club\'s literacy program has expanded to serve three additional elementary schools, thanks to new partnerships with the school district and increased volunteer participation from our members.',
                'content' => $this->getLiteracyProgramContent(),
                'category' => 'Education',
                'featured_image' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&h=300',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => Carbon::parse('2025-02-15'),
                'views' => 267,
                'read_time' => 5,
                'tags' => ['Education', 'Literacy', 'Schools', 'Volunteers'],
                'meta_description' => 'Our literacy program expanded to serve three additional elementary schools through new partnerships.',
                'author_id' => $sarah->id,
            ],
            [
                'title' => 'Global Grant Application: Maternal Health Initiative in Kenya',
                'slug' => 'global-grant-maternal-health-initiative-kenya',
                'excerpt' => 'Our club is preparing a Global Grant application to fund a maternal health initiative in rural Kenya, partnering with local Rotary clubs to improve healthcare access for expecting mothers.',
                'content' => $this->getMaternalHealthContent(),
                'category' => 'International Projects',
                'featured_image' => 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&h=300',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => Carbon::parse('2025-02-08'),
                'views' => 145,
                'read_time' => 8,
                'tags' => ['International', 'Healthcare', 'Kenya', 'Global Grant'],
                'meta_description' => 'Global Grant application for maternal health initiative in rural Kenya to improve healthcare access.',
                'author_id' => $michael->id,
            ],
        ];

        // Create the blog posts
        foreach ($blogPosts as $postData) {
            BlogPost::firstOrCreate(
                ['slug' => $postData['slug']],
                $postData
            );
        }

        // Create additional random blog posts
        BlogPost::factory(15)->create();
    }

    private function getFoodDriveContent(): string
    {
        return "<h2>A Record-Breaking Year for Community Service</h2>

<p>When we set our goal of collecting 3,000 pounds of food for our annual community food drive, we knew it was ambitious. However, the dedication and generosity of our club members, local businesses, and community partners helped us exceed that target by more than 65%, collecting an incredible 5,247 pounds of food donations.</p>

<h3>How We Organized the Drive</h3>

<p>The success of this year's food drive can be attributed to our comprehensive planning and community outreach strategy:</p>

<ul>
<li><strong>Early Planning:</strong> We began organizing three months in advance, establishing collection points and building partnerships.</li>
<li><strong>Strategic Partnerships:</strong> Local grocery stores, schools, and businesses served as collection points throughout the community.</li>
<li><strong>Member Engagement:</strong> Every club member committed to collecting donations from their personal and professional networks.</li>
<li><strong>Social Media Campaign:</strong> Our digital outreach expanded our reach beyond traditional networks.</li>
</ul>

<h3>Community Impact</h3>

<p>The 5,247 pounds of food collected will directly benefit over 150 local families through our partnership with the Ruiru Food Bank. This represents enough food to provide approximately 4,372 meals to families in need.</p>

<p>Beyond the immediate impact, this food drive has strengthened relationships within our community and demonstrated the power of collective action in addressing local needs.</p>

<h3>Looking Forward</h3>

<p>Building on this success, we're already planning next year's food drive with an even more ambitious goal. We're also exploring year-round food collection initiatives to provide consistent support to families in need.</p>

<p>Special thanks to all our volunteers, donors, and community partners who made this achievement possible. Together, we're truly making a difference in our community.</p>";
    }

    private function getWaterWellContent(): string
    {
        return "<h2>Transforming Lives Through Clean Water Access</h2>

<p>Six months ago, our Rotary club completed the installation of a new water well in the rural community of San Pedro, Guatemala. Today, we're thrilled to share the remarkable impact this project has had on the lives of over 1,200 community members.</p>

<h3>The Challenge We Addressed</h3>

<p>Before our intervention, residents of San Pedro had to walk up to 5 kilometers daily to access clean water from the nearest reliable source. This journey, typically undertaken by women and children, consumed valuable hours that could have been spent on education, income-generating activities, or family care.</p>

<h3>Project Implementation</h3>

<p>Working closely with our partner Rotary club in Guatemala City, we:</p>

<ul>
<li>Conducted comprehensive geological surveys to identify the optimal drilling location</li>
<li>Installed a solar-powered pumping system for sustainable operation</li>
<li>Built a distribution network reaching all neighborhoods in the community</li>
<li>Trained local technicians in maintenance and repair procedures</li>
<li>Established a community water committee for ongoing management</li>
</ul>

<h3>Immediate Impact</h3>

<p>The results have been extraordinary. Community leader Maria Gonzalez reports:</p>

<blockquote>
<p>'The water well has completely changed our daily lives. Children can now attend school regularly instead of spending hours fetching water. Women have started small businesses with the time they've gained. Our health has improved dramatically with access to clean, safe drinking water.'</p>
</blockquote>

<h3>Health and Education Benefits</h3>

<p>The local health clinic has documented a 78% reduction in water-borne illnesses since the well became operational. School attendance has increased by 45%, with teachers noting significant improvements in student concentration and performance.</p>

<h3>Sustainability and Future Plans</h3>

<p>This project was designed with long-term sustainability in mind. The solar-powered system requires minimal maintenance, and the community water committee has been trained to handle routine upkeep and minor repairs.</p>

<p>We're now exploring opportunities to expand this model to neighboring communities, with two additional wells planned for the coming year.</p>";
    }

    private function getYouthAcademyContent(): string
    {
        return "<h2>Developing Tomorrow's Leaders Today</h2>

<p>On February 28th, we celebrated a milestone moment as 25 exceptional high school students graduated from our inaugural Youth Leadership Academy. This intensive 12-week program was designed to equip young people with essential leadership skills and a commitment to community service.</p>

<h3>Program Overview</h3>

<p>The Youth Leadership Academy brought together students from five local high schools for a comprehensive leadership development experience. The program covered:</p>

<ul>
<li><strong>Public Speaking and Communication:</strong> Weekly workshops on presentation skills, active listening, and effective communication</li>
<li><strong>Project Management:</strong> Hands-on experience planning and executing community service projects</li>
<li><strong>Ethical Leadership:</strong> Discussions on Rotary's Four-Way Test and ethical decision-making</li>
<li><strong>Community Engagement:</strong> Field trips to local organizations and meetings with civic leaders</li>
<li><strong>Service Learning:</strong> Individual and group service projects addressing local needs</li>
</ul>

<h3>Student Achievements</h3>

<p>Throughout the program, students demonstrated remarkable growth and initiative. Highlights include:</p>

<ul>
<li>A student-led campaign that raised $3,000 for local school supplies</li>
<li>Organization of a community cleanup day that engaged over 100 volunteers</li>
<li>Development of a peer tutoring program serving 50 elementary students</li>
<li>Creation of a youth advisory committee for the city council</li>
</ul>

<h3>Graduate Spotlights</h3>

<p>Several graduates have already begun making significant impacts in their schools and communities:</p>

<p><strong>Amara Wanjiku</strong> from Ruiru High School was elected student body president just weeks after graduation, running on a platform of increased community service and environmental sustainability.</p>

<p><strong>James Kimani</strong> from St. Mary's Secondary School launched a peer counseling program that has already helped dozens of fellow students navigate academic and personal challenges.</p>

<h3>Looking Ahead</h3>

<p>Based on the overwhelming success of our first cohort, we're expanding the Youth Leadership Academy for 2025. We plan to double enrollment to 50 students and extend the program to include a summer internship component with local businesses and nonprofits.</p>

<p>Alumni from our first class will serve as mentors and guest speakers for future cohorts, creating a sustainable pipeline of youth leadership development in our community.</p>";
    }

    private function getFourWayTestContent(): string
    {
        return "<h2>Living the Four-Way Test in Business</h2>

<p>When David Brown joined our Rotary club three years ago, he was already a successful entrepreneur running a mid-sized logistics company. However, he credits Rotary's Four-Way Test with transforming not just his business practices, but his entire approach to entrepreneurship and community engagement.</p>

<h3>The Four-Way Test in Action</h3>

<p>For those unfamiliar, Rotary's Four-Way Test asks four key questions of everything we think, say, or do:</p>

<ol>
<li>Is it the TRUTH?</li>
<li>Is it FAIR to all concerned?</li>
<li>Will it build GOODWILL and BETTER FRIENDSHIPS?</li>
<li>Will it be BENEFICIAL to all concerned?</li>
</ol>

<p>David explains how he applies these principles: 'Before making any significant business decision, I literally run through these four questions. It's amazing how this simple framework can clarify complex situations and guide you toward ethical choices.'</p>

<h3>Transforming Business Culture</h3>

<p>Since implementing the Four-Way Test as a core business principle, David's company, Brown Logistics Solutions, has seen remarkable changes:</p>

<h4>1. Truth in Operations</h4>
<p>The company now maintains radical transparency with clients about delivery times, potential challenges, and pricing. While this initially seemed risky, it has actually increased client trust and loyalty.</p>

<h4>2. Fairness for All Stakeholders</h4>
<p>David restructured employee compensation to ensure fair wages across all positions and implemented a profit-sharing program. Supplier relationships were also reviewed to ensure mutually beneficial terms.</p>

<h4>3. Building Goodwill</h4>
<p>The company launched a program offering free delivery services to local nonprofits and schools. This initiative has generated positive community relationships and unexpected business referrals.</p>

<h4>4. Mutual Benefit</h4>
<p>Every business partnership is now evaluated through the lens of mutual benefit, leading to stronger, more sustainable relationships with clients and suppliers.</p>

<h3>Measurable Results</h3>

<p>The impact of these changes has been significant:</p>

<ul>
<li>Employee turnover decreased by 60%</li>
<li>Customer satisfaction scores improved from 78% to 94%</li>
<li>Annual revenue growth increased from 8% to 23%</li>
<li>The company was recognized as 'Employer of the Year' by the local chamber of commerce</li>
</ul>

<h3>Challenges and Lessons Learned</h3>

<p>David is honest about the challenges: 'Initially, some decisions felt costly in the short term. Turning down business that didn't meet our ethical standards or investing in employee benefits without immediate returns required faith in the process.'</p>

<p>However, the long-term benefits have far exceeded initial investments. 'The Four-Way Test doesn't just make you a better business person—it makes you a better person, period.'</p>

<h3>Advice for Fellow Entrepreneurs</h3>

<p>David's advice to other business owners is simple: 'Start small. Pick one area of your business and apply the Four-Way Test consistently. You'll be amazed at how it clarifies decision-making and improves outcomes.'</p>

<p>He concludes: 'Ethical business practices aren't just the right thing to do—they're also good business. The Four-Way Test provides a practical framework for achieving both.'</p>";
    }

    private function getLiteracyProgramContent(): string
    {
        return "<h2>Expanding Our Reach in Early Childhood Education</h2>

<p>We're excited to announce the expansion of our community literacy program to three additional elementary schools in the Ruiru area. This growth represents a 150% increase in our program's reach and will benefit an estimated 450 additional students in grades K-3.</p>

<h3>Program Background</h3>

<p>Our literacy program launched two years ago at Ruiru Primary School with a simple but powerful mission: to ensure every child in our community has the foundational reading skills necessary for academic success. The program pairs trained volunteers with students who need additional reading support, providing one-on-one tutoring sessions twice weekly.</p>

<h3>Proven Success at Our Original Location</h3>

<p>Before expanding, we wanted to ensure our model was effective. Results from Ruiru Primary School have been encouraging:</p>

<ul>
<li>87% of participating students improved their reading level by at least one grade equivalent</li>
<li>Student confidence in reading aloud increased dramatically</li>
<li>Teachers reported improved classroom participation from program participants</li>
<li>Parent feedback has been overwhelmingly positive</li>
</ul>

<h3>New Partner Schools</h3>

<p>We're thrilled to welcome three new schools to our literacy program:</p>

<p><strong>Kiambu Road Elementary:</strong> Serving 180 students in a rapidly growing suburban area, this school has identified 45 students who would benefit from additional reading support.</p>

<p><strong>Thika Highway Primary:</strong> This school serves many children from families where English is a second language, making our literacy support particularly valuable for 38 identified students.</p>

<p><strong>Ruiru Girls Primary:</strong> With a focus on empowering young women through education, this school will include 52 students in our program.</p>

<h3>Volunteer Training and Support</h3>

<p>Expanding to four schools requires significantly more volunteers. We've developed a comprehensive training program that includes:</p>

<ul>
<li>Child development and learning theory basics</li>
<li>Reading instruction techniques</li>
<li>Cultural sensitivity training</li>
<li>Session planning and progress tracking</li>
<li>Ongoing mentorship from experienced volunteers</li>
</ul>

<p>We're proud to report that 34 new community members have completed our volunteer training, bringing our total volunteer force to 67 dedicated individuals.</p>

<h3>Community Partners</h3>

<p>This expansion wouldn't be possible without strong community partnerships:</p>

<ul>
<li><strong>Ruiru School District:</strong> Providing administrative support and helping identify students who would benefit most</li>
<li><strong>Local Library System:</strong> Donating books and providing space for volunteer training sessions</li>
<li><strong>Teachers' Union:</strong> Offering professional development support and curriculum guidance</li>
<li><strong>Parent-Teacher Associations:</strong> Helping coordinate schedules and communicate with families</li>
</ul>

<h3>Measuring Impact</h3>

<p>We're committed to tracking our impact rigorously. Each student's progress is measured monthly using standardized reading assessments. We also collect qualitative feedback from teachers, parents, and the students themselves.</p>

<p>Early results from our new schools are promising, with initial assessments showing significant room for improvement and high enthusiasm from both students and volunteers.</p>

<h3>Future Goals</h3>

<p>Our ultimate goal is to ensure that every child in our community has access to the reading support they need. We're already in discussions with two additional schools about joining our program next year.</p>

<p>We're also exploring ways to extend our impact beyond elementary schools, potentially developing programs for middle school students who continue to struggle with reading comprehension.</p>";
    }

    private function getMaternalHealthContent(): string
    {
        return "<h2>Addressing Maternal Health Challenges in Rural Kenya</h2>

<p>Access to quality maternal healthcare remains a critical challenge in many parts of rural Kenya. Our Rotary club is preparing a comprehensive Global Grant application to address this need through a partnership with the Rotary Club of Nairobi and local healthcare organizations in Kitui County.</p>

<h3>Understanding the Need</h3>

<p>Kitui County, located in southeastern Kenya, faces significant maternal health challenges:</p>

<ul>
<li>The nearest hospital is often more than 50 kilometers away from rural communities</li>
<li>Only 47% of births are attended by skilled healthcare providers</li>
<li>Maternal mortality rates are significantly higher than the national average</li>
<li>Limited access to prenatal care and family planning services</li>
<li>Cultural barriers often prevent women from seeking care</li>
</ul>

<h3>Our Proposed Solution</h3>

<p>Working with our Kenyan partners, we've developed a comprehensive approach to improve maternal health outcomes:</p>

<h4>Mobile Health Clinics</h4>
<p>We plan to deploy two specially equipped vehicles that will provide regular prenatal care, postnatal checkups, and family planning services to remote communities. Each clinic will be staffed by a certified nurse-midwife, a community health worker, and a driver trained in emergency medical response.</p>

<h4>Community Health Worker Training</h4>
<p>We'll train 40 local women as community health workers, providing them with skills to:</p>
<ul>
<li>Conduct basic prenatal screenings</li>
<li>Educate expectant mothers about nutrition and self-care</li>
<li>Identify high-risk pregnancies requiring medical attention</li>
<li>Provide postnatal support and newborn care guidance</li>
<li>Connect families with available healthcare resources</li>
</ul>

<h4>Infrastructure Improvements</h4>
<p>We'll upgrade two existing health dispensaries with:</p>
<ul>
<li>Solar power systems for reliable electricity</li>
<li>Water storage and purification systems</li>
<li>Basic laboratory equipment for testing</li>
<li>Communication equipment for emergency situations</li>
<li>Delivery beds and essential medical supplies</li>
</ul>

<h3>Partnership Structure</h3>

<p>This initiative brings together multiple organizations:</p>

<p><strong>International Partners:</strong></p>
<ul>
<li>Ruiru Central Neighbourhood Rotary Club (lead applicant)</li>
<li>Rotary Club of Nairobi (primary partner)</li>
<li>District 9212 (Kenya and Tanzania)</li>
</ul>

<p><strong>Local Partners:</strong></p>
<ul>
<li>Kitui County Ministry of Health</li>
<li>Kenyatta University School of Nursing</li>
<li>Local women's groups and community organizations</li>
<li>Traditional leaders and religious organizations</li>
</ul>

<h3>Sustainability Plan</h3>

<p>Long-term sustainability is central to our approach:</p>

<ul>
<li><strong>Local Ownership:</strong> Community health workers and local health committees will take primary responsibility for program implementation</li>
<li><strong>Government Integration:</strong> All services will be integrated into the existing county health system</li>
<li><strong>Revenue Generation:</strong> Mobile clinics will charge modest fees for services to cover operational costs</li>
<li><strong>Ongoing Training:</strong> Annual refresher training for health workers and quarterly supervisory visits</li>
</ul>

<h3>Expected Impact</h3>

<p>If approved, this three-year project will:</p>

<ul>
<li>Provide prenatal care to approximately 1,500 expectant mothers annually</li>
<li>Increase the percentage of skilled birth attendance from 47% to 75%</li>
<li>Train 40 community health workers who will continue serving their communities</li>
<li>Improve healthcare infrastructure serving over 15,000 people</li>
<li>Reduce maternal and infant mortality rates in the target area</li>
</ul>

<h3>Budget and Timeline</h3>

<p>The total project budget is $125,000, with funding provided through:</p>
<ul>
<li>Rotary Foundation Global Grant: $75,000</li>
<li>District Designated Funds: $25,000</li>
<li>Club and community contributions: $25,000</li>
</ul>

<p>We expect to submit our application by the end of March, with project implementation beginning in September 2025 if approved.</p>

<h3>How You Can Help</h3>

<p>We're seeking additional support for this vital project:</p>
<ul>
<li>Financial contributions to increase our local funding match</li>
<li>Medical supplies and equipment donations</li>
<li>Professional volunteers for training and supervision</li>
<li>Advocacy support for our Global Grant application</li>
</ul>

<p>Together, we can make a lasting difference in the lives of mothers and children in rural Kenya. This project embodies Rotary's commitment to maternal and child health while building sustainable, community-driven solutions.</p>";
    }
}
