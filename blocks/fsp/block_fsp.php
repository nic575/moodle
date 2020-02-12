<?php

/*
 * See license information at the package root in LICENSE.md
 */

/**
 * Description of block_fsp
 *
 * @author Justus
 */

$includePath = realpath(__DIR__ . '/../../usermgmt/lib/lib-users.php');


if(file_exists($includePath)) {
    
    require_once($includePath);        
}

class block_fsp extends block_base {

    protected function format($data, $value, $format = null) {
        
        if($format === 'date') {
            
            //TODO
        }
        
        
        if($format === 'bool') {
            
            return ($data[$value] == 1 ? 'X' : '-');
        }        
        
        return $data[$value];
    }
    
    public function init() {

        $this->title = get_string('fsp', 'block_fsp');
    }

    public function get_content() {
        
        if ($this->content !== null) {
            
            return $this->content;
        }
                
        if(!class_exists("Users")) {
            
            throw new Exception("Could not find User Management library class 'Users' - is it uploaded to the server?");
        }
        
        global $USER;
        
        //$institutionId = intval($USER->profile['institution_id']);
        
        $institutionId = 2;
        
        $usrLib = new Users();
        $data = $usrLib->getFSP($institutionId);
        
        $this->content = new stdClass;
        
        ob_start();
?>
<div class="container">
    <ul class="nav nav-pills">
      <li class="active btn-lg"><a data-toggle="pill" href="#myfsp">My FSP</a></li>
      <li class="button btn-lg"><a  data-toggle="pill" href="#compliance">Compliance</a></li>
      <li class="button btn-lg"><a data-toggle="pill" href="#kisReps">Reps & KIs</a></li>
      <li class="button btn-lg"><a data-toggle="pill" href="#approveduwrs">Product providers</a></li>
      <li class="button btn-lg"><a data-toggle="pill" href="#manageUsers">Manage Users</a></li>
    </ul>
    <br>
    <div class="tab-content">
      <div id="myfsp" class="tab-pane fade in active">
      <h3>My FSP</h3>
      <table class="admintable generaltable table-sm">
        <tbody>
            <tr>
                <th>Date Updated</th>
                <td><?php echo $this->format($data['institution'], 'date_updated', 'date'); ?></td>
            </tr>
            <tr>
                <th>FSP No</th>
                <td><?php echo $this->format($data['institution'], 'fsp_no', null); ?></td>
            </tr>
            <tr>
                <th>FSP Name</th>
                <td><?php echo $this->format($data['institution'], 'fsp_name', null); ?></td>
            </tr>
            <tr>
                <th>FSP Type</th>
                <td><?php echo $this->format($data['institution'], 'fsp_type', null); ?></td>
            </tr>
            <tr>
                <th>Registration Number</th>
                <td><?php echo $this->format($data['institution'], 'registration_number', null); ?></td>
            </tr>
            <tr>
                <th>Date Authorised</th>
                <td><?php echo $this->format($data['institution'], 'date_authorised', 'date'); ?></td>
            </tr>
            <tr>
                <th>Physical Address</th>
                <td><?php echo $this->format($data['institution'], 'physical_address', null); ?></td>
            </tr>
            <tr>
                <th>Telephone No</th>
                <td><?php echo $this->format($data['institution'], 'telephone_no', null); ?></td>
            </tr>
            <tr>
                <th>Contact Person</th>
                <td><?php echo $this->format($data['institution'], 'contact_person', null); ?></td>
            </tr>
            <tr>
                <th>Contact Person Tel No</th>
                <td><?php echo $this->format($data['institution'], 'contact_person_telephone_no', null); ?></td>
            </tr>
            <tr>
                <th>Status</th>
                <td><?php echo $this->format($data['institution'], 'status', null); ?></td>
            </tr>        
        </tbody>
        </table>
      </div>
      <div id="compliance" class="tab-pane fade">
        <h3>Compliance Officer(s)</h3>
        <table class="admintable generaltable table-sm">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Tel No</th>        
                </tr>
            </thead>
            <tbody>
                <?php foreach($data['compliance_officers'] as $item): ?>
                <tr>
                    <td><?php echo $this->format($item, 'name', null); ?></td>
                    <td><?php echo $this->format($item, 'telephone_no', null); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <br>
        <h3>Approved Products</h3>
        <table class="admintable generaltable table-sm">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Advice Automated</th>
                    <th>Advice Non-automated</th> 
                    <th>Intermediary Scripted</th> 
                    <th>Intermediary Other</th> 
                </tr>
            </thead>
            <tbody>
                <?php foreach($data['approved_products'] as $item): ?>
                <tr>
                    <td><?php echo $this->format($item, 'category', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'advice_automated', 'bool'); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'advice_nonautomated', 'bool'); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'intermediary_scripted', 'bool'); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'intermediary_other', 'bool'); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
      </div>
      <div id="kisReps" class="tab-pane fade">
        <h3>Key Individuals</h3>
        <table class="admintable generaltable table-sm"> 
            <thead>
                <tr>
                    <th>Full Names</th>
                    <th>Surname</th>        
                    <th>KI of Rep</th>
                    <th>Class of Business</th>
                    <th>Category I</th>
                    <th>Category II</th>
                    <th>Category IIA</th>
                    <th>Category III</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach($data['key_individuals'] as $item): ?>
                <tr>
                    <td><?php echo $this->format($item, 'names', null); ?></td>
                    <td><?php echo $this->format($item, 'surname', null); ?></td>
                    <td><?php echo $this->format($item, 'ki_of_rep', null); ?></td>
                    <td><?php echo $this->format($item, 'ClassOfBusiness', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'categoryI', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'categoryII', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'categoryIIA', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'categoryIII', null); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <br>
        <h3>Representatives</h3>
        <table class="admintable generaltable table-sm">
            <thead>
                <tr>
                    <th>Full Names</th>
                    <th>Surname</th>        
                    <th>Category</th>
                    <th>Sub-Category</th>
                    <th>Description</th>
                    <th>Advice</th>
                    <th>Intermediary-scripted</th>        
                    <th>Intermediary-other</th> 
                    <th>Services under supervision</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach($data['representatives'] as $item): ?>
                <tr>
                    <td><?php echo $this->format($item, 'names', null); ?></td>
                    <td><?php echo $this->format($item, 'surname', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'category', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'subcategory', null); ?></td>
                    <td><?php echo $this->format($item, 'category_desc', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'advice', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'intermediary_scripted', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'intermediary_other', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'services_under_supervision', null); ?></td>

                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
      </div>
      <div id="approveduwrs" class="tab-pane fade">
        <h3>Approved Product Providers on Platform</h3>
        <table class="admintable generaltable table-sm">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Advice automated</th>
                    <th>Advice non-automated</th>
                    <th>Intermediary - scripted</th>
                    <th>Intermediary - other</th>      
                </tr>
            </thead>
            <tbody>
                <?php foreach($data['approved_product_providers'] as $item): ?>
                <tr>
                    <td><?php echo $this->format($item, 'category', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'advice_automated', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'advice_nonautomated', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'intermediary_scripted', null); ?></td>
                    <td class="text-center"><?php echo $this->format($item, 'intermediary_other', null); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
      </div>
    </div>
</div>


<?php      
        $this->content->text = ob_get_clean();                
        $this->content->footer = '';

        return $this->content;
    }

}
